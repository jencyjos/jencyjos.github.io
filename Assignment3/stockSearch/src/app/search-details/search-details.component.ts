import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../services/stock.service';
import { MatDialog } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PortfolioService } from '../services/portfolio.service';

// import HC_exporting from 'highcharts/modules/exporting'; 
import { NewsDetailModalComponent } from '../news-detail-modal-component/news-detail-modal-component.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuyModalComponent } from '../buy-modal/buy-modal.component';
import { SellModalComponent } from '../sell-modal/sell-modal.component';
import { SearchStateService } from '../services/SearchState.service';

import * as Highcharts from 'highcharts';
import HC_stock from 'highcharts/modules/stock';
import indicators from "highcharts/indicators/indicators";
import vbpa from "highcharts/indicators/volume-by-price";
HC_stock(Highcharts);
indicators(Highcharts);
vbpa(Highcharts);

// HC_exporting(Highcharts);
// insider-sentiment.model.ts
interface Stock {
  ticker: string;
  // ... any other properties
}

interface RecommendationData {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string
}


interface NewsArticle {
  headline: string;
  image: string;
}
interface EarningsData {
  actual: number;
  estimate: number;
  period: string;
  symbol: string;
  surprise: string;
}

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.css']
})

export class SearchDetailsComponent implements OnInit, OnDestroy {
  ticker: string = '';
  // stockProfile: any;
  // stockQuote: any;
  @Input() searchQuery: string = '';
  @Input() stockProfile: any;
  @Input() stockQuote: any;
  inPortfolio: boolean = false; // Determine if stock is in portfolio
  marketOpen: boolean = false; // Determine if market is open
  topNews : any[] =[];
  Highcharts: typeof Highcharts = Highcharts; // required
  chartOptions?: Highcharts.Options = {}; 
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  isFavorite: boolean = false;
  onFav: boolean = false;
  onUnfav: boolean = false;
  searchResults: any;
  results: any;
  watchlist: string[] = []; 
  companyPeers : any[] =[];
  insiderSentimentData: any;
  lastUpdatedTime: string = ""; 
  tickerNotFound : boolean = false;
  todayDate: any;
  walletBalance: number = 0;
  stocks: any[] = []; 
  stock: any;
  state:any;
  
  historicalChartOptions!: Highcharts.Options;
  smaChartOptions!: Highcharts.Options;
  earningsChartOptions!: Highcharts.Options;
  recommendationChartOptions!: Highcharts.Options;

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private searchStateService: SearchStateService,
    private snackBar: MatSnackBar,
    private portfolioService: PortfolioService,
    
    
  ) {
    this.tickerNotFound = false;
    this.setCurrentTime();}

  setCurrentTime() {
    const now = new Date();
    this.todayDate = now;
    this.lastUpdatedTime = formatDate(now, 'yyyy-MM-dd HH:mm:ss', 'en-US');
  }


  ngOnChanges(): void {
    if (this.searchQuery) {
      this.state = this.stockService.getState();
      if (this.state.ticker === null || this.state.ticker === undefined || this.searchQuery !== this.state.ticker){
        console.log("I am here 3", this.state.ticker);
        this.fetchStockDetails(this.searchQuery);
      } else {
        console.log("I am here 2", this.state.ticker);
        this.stockQuote = this.state.stockQuote;
        this.stockProfile = this.state.stockProfile;
        this.topNews = this.state.topNews;
        this.companyPeers = this.state.companyPeers;
        this.insiderSentimentData = this.state.insiderSentimentData;
        this.drawPriceChart(this.state.priceChartData);
        this.drawSMAChart(this.state.smaChartData);
        this.drawEarningsChart(this.state.earningsChartData);
        this.drawRecommendationChart(this.state.recommendationChartData);
      }
    }
  }


  //------------------------------------this is for the state - fix it
  ngOnInit() {
    this.searchStateService.searchResults$.subscribe(results => {
      this.searchResults = results;

    });
    this.state.searchResults = this.searchResults;
    this.stockService.setState(this.state);
    this.checkIfFavorite(this.stockProfile.ticker);
    this.ngOnChanges();
  }



  ngOnDestroy() {
    // Unsubscribe from any subscriptions to prevent memory leaks
  }

  // fetchPortfolioetails(): void {
  //     this.portfolioService.getStockDetails(this.searchQuery).subscribe(
  //       (data: any) => {
  //         this.stock = data;
  //         let check = this.stock.filter(x => x.ticker == this.searchQuery)
  //         if(check[0] == this.searchQuery){
  //           this.inPortfolio = true;
  //         }
  //       },
  //       (error: any) => {
  //         console.error('Error fetching stock details', error);
  //       }
  //     ); 
  // }

  fetchPortfolioDetails(): void {
    this.portfolioService.getStockDetails(this.searchQuery).subscribe(
      (data: Stock[]) => { // Assuming that getStockDetails returns an array of Stock
        this.stock = data;
        let check = this.stock.filter((x: Stock) => x.ticker === this.searchQuery);
        if(check.length > 0 && check[0].ticker === this.searchQuery){
          this.inPortfolio = true;
        }
      },
      (error: any) => {
        console.error('Error fetching stock details', error);
      }
    );
  }
  fetchStockDetails(ticker: string): void {
    this.checkIfFavorite(ticker); 
    this.state.ticker = ticker;
    this.stockService.setState(this.state);

    this.stockService.getStockQuote(ticker).subscribe(data => {
      this.stockQuote = data;
      this.state.stockQuote = this.stockQuote;
      this.stockService.setState(this.state);
      this.determineMarketStatus();
    });

    this.stockService.getStockProfile(ticker).subscribe(data => {
      this.stockProfile = data;
      this.state.stockProfile = this.stockProfile;
      this.stockService.setState(this.state);
      if(JSON.stringify(this.stockProfile) === '{}'){
        this.tickerNotFound = true;
      }

    });

    this.stockService.getTopNews(ticker).subscribe(data => {
      this.topNews = data;
      this.state.topNews = this.topNews;
      this.stockService.setState(this.state);
    }, error => {
      console.error('Error fetching top news', error);
    });

    this.stockService.getCompanyPeers(ticker).subscribe(data => {
      this.companyPeers = data;
      this.state.companyPeers = this.companyPeers;
      this.stockService.setState(this.state);

    }, error => {
      console.error('Error fetching company peers', error);
    });

    this.stockService.getCompanySentiment(ticker.toUpperCase()).subscribe(data => {
      this.insiderSentimentData = data;
      this.state.insiderSentimentData = this.insiderSentimentData;
      this.stockService.setState(this.state);
      console.log(this.insiderSentimentData);
      console.log("this",ticker);
    }, error => {
      console.error('Error fetching companys insider sentiments', error);
    });
    
    this.stockService.getCompanySentiment(ticker).toPromise()

  // all charts here

  //historical chart - summary tab
    this.stockService.getHighCharts(ticker).subscribe(data => {
      this.state.priceChartData = data;
      this.stockService.setState(this.state);
      this.drawPriceChart(this.state.priceChartData);
    }, error => {
      console.error('Error fetching top news', error);
    });


    //sma chart 
    this.stockService.getSmaCharts(ticker).subscribe(data => {
      this.state.smaChartData = data;
      this.stockService.setState(this.state);
      this.drawSMAChart(this.state.smaChartData);
    }, error => {
      console.error('Error fetching top news', error);
    });

    this.stockService.getEarningsData(ticker).subscribe((data: EarningsData[]) => {
      this.state.earningsChartData = data;
      this.stockService.setState(this.state);
      this.drawEarningsChart(this.state.earningsChartData);
    }, error => {
      console.error('Error fetching earnings chart', error);
    });


    //recommendation charts
    this.stockService.getRecommendationCharts(ticker).subscribe(data => {
      this.state.recommendationChartData = data;
      this.stockService.setState(this.state);
      this.drawRecommendationChart(this.state.recommendationChartData);
    }, error => {
      console.error('Error fetching top news', error);
    });

  }

  checkIfFavorite(ticker: string) {
    console.log("ticker 11", ticker)
    this.stockService.getWatchlist().subscribe({
      next: (watchlist) => {
        this.watchlist = watchlist.map(stock => stock.ticker);
        this.isFavorite = this.watchlist.includes(ticker);
      },
      error: (error) => {
        console.error('Error fetching watchlist', error);
      }
    });
  }

  

  drawPriceChart(stockData: any): void {
    this.historicalChartOptions= {
      chart: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)'
      },
      accessibility: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        line: {
        marker: {
          enabled: false
        }
      }
    },
      title:
      {
        text: `${this.stockProfile.ticker} Hourly Price Variation`
      },

      xAxis: {
        type: 'datetime'
      },

      yAxis: {
        labels: {
          align: 'left',
        },
        title: {
              text: ''
          },
          opposite: true,
          lineWidth: 0,
          resize: {
            enabled: false
          }
        },
      tooltip: {
        split: true
      },
      series: [
          {
            type: 'line',
            name: this.stockProfile.ticker,
            data: stockData["stockPriceData"],
            yAxis: 0,
            threshold: null,
            tooltip: {
                valueDecimals: 2
            }
          }
        ],
      };
  };

  // drawRecommendationChart(insightsData: any): void {
  //   this.recommendationChartOptions = {

  //     accessibility: {
  //         enabled: false
  //     },
  //     chart: {
  //         type: 'column',
  //         backgroundColor: 'rgba(0, 0, 0, 0.05)'
  //     },
  
  //     yAxis: {
  //         title: {
  //             text: 'Analysis'
  //         },
  //         stackLabels: {
  //             enabled: false
  //         },
  //         opposite: false,
  //         lineWidth: 0,
  //         resize: {
  //             enabled: false
  //         }
  //     },
  //     title: {
  //         text: 'Recommendation Trends',
  //         align: 'center'
  //     },
    
  //     plotOptions: {
  //         column: {
  //             stacking: 'normal',
  //             dataLabels: {
  //                 enabled: true
  //             }
  //         }
  //     },
  
  
  //     xAxis: {
  //         categories: insightsData['recommendation'].xAxis
  //     },

  
  //     series: [{
  //         name: 'Strong Buy',
  //         data: insightsData['recommendation'].yAxis.strongBuy,
  //         type:'column',
  //         color: '#008000'
  //     }, {
  //         name: 'Buy',
  //         data: insightsData['recommendation'].yAxis.buy,
  //         type:'column',
  //         color: '#04af70'
  //     }, {
  //         name: 'Hold',
  //         data: insightsData['recommendation'].yAxis.hold,
  //         type:'column',
  //         color: '#a68004'
  //     },
  //     {
  //       name: 'Sell',
  //       data: insightsData['recommendation'].yAxis.sell,
  //       type:'column',
  //       color: '#f28500'
  //   },
  //   {
  //     name: 'Strong Sell',
  //     data: insightsData['recommendation'].yAxis.strongSell,
  //     type:'column',
  //     color: '#800080'
  // }] 
  
  // };
  
  // };


  drawRecommendationChart(recommendationData: RecommendationData[]) {
    const categories = recommendationData.map(data => data.period);
  
    // Series data for each type of recommendation
    const series : Highcharts.SeriesOptionsType[] = [
      {
        name: 'Strong Sell',
        type: 'column',
        data: recommendationData.map(data => data.strongSell),
        color: '#FF6347', // Tomato red for Strong Sell
        stack: 'recommendations'
      },
      {
        name: 'Sell',
        type: 'column',
        data: recommendationData.map(data => data.sell),
        color: '#FFA07A', // Light Salmon for Sell
        stack: 'recommendations'
      },
      {
        name: 'Hold',
        type: 'column',
        data: recommendationData.map(data => data.hold),
        color: '#FFD700', // Gold for Hold
        stack: 'recommendations'
      },
      {
        name: 'Buy',
        type: 'column',
        data: recommendationData.map(data => data.buy),
        color: '#9ACD32', // Yellow Green for Buy
        stack: 'recommendations'
      },
      {
        name: 'Strong Buy',
        type: 'column',
        data: recommendationData.map(data => data.strongBuy),
        color: '#006400', // Dark Green for Strong Buy
        stack: 'recommendations'
      },
    ];
  
    // Configure the chart options
    this.recommendationChartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Recommendation Trends'
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Number of Analyst Recommendations'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold'
          }
        }
      },
      tooltip: {
        shared: true
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: false
          }
        }
      },
      series: series,
      legend: {
        reversed: true
      }
    };
  
    // Now you can use this.recommendationChartOptions in your Highcharts chart component.
  }


 
  // drawEarningsChart(earningsData: any): void {
  //   const actualData = earningsData.map((item: EarningsData) => item.actual !== null ? item.actual : 0);
  //   const estimateData = earningsData.map((item: EarningsData) => item.estimate !== null ? item.estimate : 0);
  //   const categories = earningsData.map((item: EarningsData) => `${item.period}\nSurprise: ${item.surprise}`);
  //   this.earningsChartOptions = {
      
  //       chart: {
  //           type: 'spline',
  //           backgroundColor: 'rgba(0, 0, 0, 0.05)'
  //       },
  //       accessibility: {
  //           enabled: false
  //       },
  //       title: {
  //           text: 'Historical EPS Suprises',
  //           align: 'center'
  //       },

  //       xAxis: {
  //         crosshair: true,
  //         categories: earningsData["earnings"].xAxis,
  //       },
  //       yAxis: {
  //           title: {
  //               text: 'Quarterly EPS'
  //           },
  //           opposite: false,
  //           lineWidth: 0,
  //           resize: {
  //               enabled: false
  //           }
  //       },
  //       tooltip: {
  //           shared: true
  //       },
  //       plotOptions: {
  //           spline: {
  //               marker: {
  //                   radius: 3
  //               }
  //           }
  //       },
  //       series: [{
  //           type: 'spline',
  //           name: 'Actual',
  //           marker: {
  //               symbol: 'circle'
  //           },
  //           data: earningsData["earnings"].yAxis.actual

  //       }, {
  //         type: 'spline',
  //         name: 'Estimate',
  //           marker: {
  //               symbol: 'diamond'
  //           },
  //           data: earningsData["earnings"].yAxis.estimate
  //       }]
  //   }
  // };
  drawEarningsChart(earningsData: EarningsData[]): void {
    const actualData = earningsData.map(item => ({
      y: item.actual,
      marker: {
        symbol: 'circle'
      }
    }));
  
    const estimateData = earningsData.map(item => ({
      y: item.estimate,
      marker: {
        symbol: 'circle'
      }
    }));
  
    const categories = earningsData.map(item => `${item.period}\nSurprise: ${item.surprise}`);
  
    this.earningsChartOptions = {
      chart: {
        type: 'spline',
        backgroundColor: 'rgba(0, 0, 0, 0.05)'
      },
      title: {
        text: 'Historical EPS Surprises',
        align: 'center'
      },
      xAxis: {
        crosshair: true,
        categories: categories
      },
      yAxis: {
        title: {
          text: 'Quarterly EPS'
        }
      },
      tooltip: {
        shared: true
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 4
          }
        }
      },
      series: [{
        name: 'Actual',
        type: 'spline',
        data: actualData,
        color: 'blue' // choose the color you prefer for actual values
      }, {
        name: 'Estimate',
        type: 'spline',
        data: estimateData,
        color: 'lightblue' // choose the color you prefer for estimate values
      }]
    };
  
    // Trigger chart update if necessary, e.g., using Angular's change detection
  }

  drawSMAChart(smaData : any): void {
    this.smaChartOptions = {
        accessibility: {
            enabled: false
        },

        legend: {
          enabled: false
        },

        exporting: {
            enabled: true
        },

        rangeSelector: {
          enabled: true,
          inputEnabled: true,
          allButtonsEnabled: true,
          selected: 2,
          buttons: [
            {
              type: 'month',
              count: 1,
              text: '1m',
              title: 'View 1 month'
          }, {
              type: 'month',
              count: 3,
              text: '3m',
              title: 'View 3 months'
          }, {
              type: 'month',
              count: 6,
              text: '6m',
              title: 'View 6 months'
          }, {
              type: 'ytd',
              text: 'YTD',
              title: 'View year to date'
          }, {
              type: 'year',
              count: 1,
              text: '1y',
              title: 'View 1 year'
          }, {
              type: 'all',
              text: 'All',
              title: 'View all'
          }
          ]
        },

        title: {
            text: `${this.searchQuery} Historical`
        },

        subtitle: {
            text: 'With SMA and Volume by Price technical indicators'
        },

        navigator: {
            enabled: true
            // series: {
            //     accessibility: {
            //         exposeAsGroupOnly: true
            //     }
            // }
        },

        xAxis: {
          type: 'datetime'
        },

        yAxis: [{
            opposite: true,
            startOnTick: false,
            endOnTick: false,
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            opposite: true,
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],

        tooltip: {
            split: true
        },

        plotOptions: {
            series: {
                dataGrouping: {
                    units: [[
                        'week',                         
                        [2]                             
                    ], [
                        'month',
                        [1, 2, 3, 4, 6]
                    ]]
                }
            }
        },

        series: [{
            type: 'candlestick',
            name: 'AAPL',
            id: 'aapl',
            zIndex: 2,
            data: smaData['stockPriceData']
        }, {
            type: 'column',
            name: 'Volume',
            id: 'volume',
            data: smaData['volumeData'],
            yAxis: 1
        }, {
            type: 'vbp',
            linkedTo: 'aapl',
            params: {
                volumeSeriesID: 'volume'
            },
            dataLabels: {
                enabled: false
            },
            zoneLines: {
                enabled: false
            }
        }, {
            type: 'sma',
            linkedTo: 'aapl',
            zIndex: 1,
            marker: {
                enabled: false
            }
        }]
    }
  }

    // determineMarketStatus() {
    //   if (this.stockQuote && this.stockQuote.t) {
    //     const lastUpdate = new Date(this.stockQuote.t * 1000);
    //     const now = new Date();
    //     const difference = now.getTime() - lastUpdate.getTime();
    
    //     console.log(`Last update: ${lastUpdate}`);
    //     console.log(`Current time: ${now}`);
    //     console.log(`Difference in minutes: ${difference / 60000}`);
    
    //     this.marketOpen = difference < 5 * 60 * 1000;
    //   }
    // }
    determineMarketStatus() {
      if (this.stockQuote && this.stockQuote.t) {
        const lastUpdate = new Date(this.stockQuote.t * 1000);
        const now = new Date();
        const difference = now.getTime() - lastUpdate.getTime();
    
        console.log(`Last update: ${lastUpdate}`);
        console.log(`Current time: ${now}`);
        console.log(`Difference in minutes: ${difference / 60000}`);
    
        this.marketOpen = difference < 5 * 60 * 1000;
        if (this.marketOpen == false) {
          this.lastUpdatedTime = formatDate(lastUpdate.getTime(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
        }
      }
    }
  
     
  openNewsModal(newsArticle : NewsArticle): void {
    const dialogRef = this.dialog.open(NewsDetailModalComponent, {
      width: '30%',
      height: '40%',
      data: newsArticle // Pass the newsArticle as data to the modal
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  // toggleWatchlist(ticker: string): void {
  //   // Toggle the visual state
  //   this.isFavorite = !this.isFavorite;

  //   // Call the StockService method to add/remove from watchlist
  //   this.stockService.toggleWatchlist(ticker).subscribe({
  //     next: (response) => {
  //       // Display a self-closing alert with the response message
  //       this.isFavorite = !this.isFavorite; 
  //       alert(response.message);
  //     },
  //     error: (error) => {
  //       console.error('Error updating watchlist', error);
  //     }
  //   });
  // }

  toggleWatchlist(ticker: string): void {
    // Assuming this.isFavorite already toggled by the method caller or handled here
    this.stockService.toggleWatchlist(ticker).subscribe({
      next: (response) => {
        // Use MatSnackBar for the message
        if(this.isFavorite){
        this.onUnfav = true;
        setTimeout(() => {
          this.onUnfav =false;
        }, 5000);
      }
      else if(!this.isFavorite){
        this.onFav = true;
        setTimeout(() => {
          this.onFav =false;
        }, 5000);
      }

        // Optionally toggle isFavorite based on actual operation success
        this.isFavorite = !this.isFavorite; 
      },
      error: (error) => {
        console.error('Error updating watchlist', error);
        this.snackBar.open('Failed to update watchlist. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    });
  }
  

  openBuyModal() {
    // Logic to open the Buy Modal
    const buyModalRef = this.modalService.open(BuyModalComponent);
    buyModalRef.componentInstance.stock = this.stockQuote;
    buyModalRef.componentInstance.stock = {
      ticker: this.stockProfile.ticker,
      currentPrice: this.stockQuote.c,
       // Pass the current stock details to the modal
    };
    buyModalRef.result.then((result) => {
      if (result === 'buyConfirmed') {
        // Handle the buy confirmation, update wallet, portfolio, etc.
      }
    }, (reason) => {
      // Handle the dismiss
    });
}

openSellModal(stock: any): void {
  const modalRef = this.modalService.open(SellModalComponent);
  modalRef.componentInstance.stock = stock;

  modalRef.result.then((result) => {
    if (result && result.success == true) {
      this.loadPortfolio();
      this.loadWalletBalance(); // Reload balance and portfolio to reflect changes
    }
  }, (reason) => {});
}

loadPortfolio(): void {
  this.portfolioService.getPortfolio().subscribe(
    (data: any) => { // Adjust based on your actual Stock model
      this.stocks =[...data.stocks];;
      this.fetchStockDetails(this.searchQuery);
      this.fetchCurrentPrice();
    },
    (error: any) => {
      console.error('Error fetching portfolio', error);
    }
  );
}


loadWalletBalance(): void {
  // Implement this method in your service
  this.portfolioService.getWalletBalance().subscribe(
    (data: { balance: number }) => {
      this.walletBalance = data.balance;
    },
    (error: any) => {
      console.error('Error fetching wallet balance', error);
    }
  );
}


fetchCurrentPrice(): void {
  for (let stock of this.stocks) {
    this.portfolioService.getStockPrice(stock.ticker).subscribe(
      (data: any) => {
        stock.currentPrice = data.c;
      },
      (error: any) => {
        console.error('Error fetching stock details', error);
      }
    );
  }
}




  
}
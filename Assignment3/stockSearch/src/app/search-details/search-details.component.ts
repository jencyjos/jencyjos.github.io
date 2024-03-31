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
import { Stock } from '../../../../backend/models/stock.model';

HC_stock(Highcharts);
indicators(Highcharts);
vbpa(Highcharts);

// HC_exporting(Highcharts);
// insider-sentiment.model.ts
// interface Stock {
//   ticker: string;
// }

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
  autoUpdateInterval: any; 
  ticker: string = '';
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

  ngOnInit() {
    this.searchStateService.searchResults$.subscribe(results => {
      this.searchResults = results;

    });
    this.state.searchResults = this.searchResults;
    this.stockService.setState(this.state);
    this.checkIfFavorite(this.stockProfile.ticker);
    this.checkInPortfolio(this.stockProfile.ticker);
    // this.startAutoUpdate(this.stockProfile.ticker);
    this.ngOnChanges();
    
  }

  ngOnDestroy() {
    // Unsubscribe from any subscriptions to prevent memory leaks
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
  }


  fetchStockDetails(ticker: string): void {
    console.log(
      "tetsing market open"
    )
    this.checkIfFavorite(ticker); 
    this.checkInPortfolio(ticker);
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

  checkInPortfolio(ticker: string) {
    console.log("checkInPortfolio ticker 11", ticker)
    this.portfolioService.checkStockInPortfolio(ticker).subscribe({
      next: (isInPortfolio: boolean) => {
        this.inPortfolio = isInPortfolio; // directly set inPortfolio based on the response
        console.log("hsdfjsdhfksjdhfsdhfk")
        console.log(this.inPortfolio)
      },
      error: (error) => {
        console.error('Error checking if stock is in portfolio', error);
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

  drawRecommendationChart(recommendationData: RecommendationData[]) {
    const categories = recommendationData.map(data => data.period);
  
    // Series data for each type of recommendation
    const series : Highcharts.SeriesOptionsType[] = [
      {
        name: 'Strong Sell',
        type: 'column',
        data: recommendationData.map(data => data.strongSell),
        color: '#800080',
        stack: 'recommendations'
      },
      {
        name: 'Sell',
        type: 'column',
        data: recommendationData.map(data => data.sell),
        color: 'red',
        stack: 'recommendations'
      },
      {
        name: 'Hold',
        type: 'column',
        data: recommendationData.map(data => data.hold),
        color: '#a68004',
        stack: 'recommendations'
      },
      {
        name: 'Buy',
        type: 'column',
        data: recommendationData.map(data => data.buy),
        color: '#04af70', 
        stack: 'recommendations'
      },
      {
        name: 'Strong Buy',
        type: 'column',
        data: recommendationData.map(data => data.strongBuy),
        color: '#008000',
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
  
  }

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

    determineMarketStatus() {
      if (this.stockQuote && this.stockQuote.t) {
        const lastUpdate = new Date(this.stockQuote.t * 1000);
        const now = new Date();
        const difference = now.getTime() - lastUpdate.getTime();
    
        console.log(`Last update: ${lastUpdate}`);
        console.log(`Current time: ${now}`);
        console.log(`Difference in minutes: ${difference / 60000}`);
    
        this.marketOpen = difference > 5 * 60 * 1000;
        if (this.marketOpen == false) {
          this.lastUpdatedTime = formatDate(lastUpdate.getTime(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
        }
      }
    }
    startAutoUpdate(ticker : string) {
      // Start auto-update only if the market is open
      this.determineMarketStatus(); // Make sure the market status is updated before starting
      if (this.marketOpen) {
        this.autoUpdateInterval = setInterval(() => {
          this.fetchStockDetails(ticker); // Assuming this.ticker is the current ticker symbol
          console.log("auto update for ", this.ticker);
          this.determineMarketStatus(); // Check if the market is still open
          if (!this.marketOpen && this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval); // Stop updating if the market closes
          }
        }, 15000); // Update every 15 seconds
      }
    }
     
  openNewsModal(newsArticle : NewsArticle): void {
    const dialogRef = this.dialog.open(NewsDetailModalComponent, {
      width: '340px',
      height: '300px',
      data: newsArticle // Pass the newsArticle as data to the modal
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }



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
    buyModalRef.componentInstance.stock = {ticker: this.stockProfile.ticker, name: this.stockProfile.name, currentPrice: this.stockQuote.c}
    console.log(buyModalRef.componentInstance.stock)
    buyModalRef.result.then((result) => {
      if (result && result.success == true) {
        console.log("bought ", this.stockProfile.ticker)
        this.loadPortfolio();
        this.loadWalletBalance();
      }
    }, (reason) => {
      console.log("oh crap", reason)
    });
  }

openSellModal(): void {
 const modalRef = this.modalService.open(SellModalComponent);
 this.portfolioService.getStockByTicker(this.stockProfile.ticker).subscribe({
 next: (stock: Stock| null) => {
 if (stock) {
 console.log("In sell", stock)
 modalRef.componentInstance.stock = {ticker: stock.ticker, name: stock.name, averageCost: stock.averageCost, currentPrice: this.stockQuote.c, shares: stock.shares}
 modalRef.result.then((result) => {
 if (result && result.success == true) {
 console.log("sold ", this.stockProfile.ticker) 
 this.loadPortfolio();
 this.loadWalletBalance(); // Reload balance and portfolio to reflect changes
 }
 }, (reason) => {
 console.log("reason due to we coulnt sell", reason)
 });
 } else {
 console.error('Stock not found: ', this.stockProfile.ticker);
 // Optionally close the modal if the stock isn't found
 modalRef.close();
 }
 
 },
 error: (error) => {
 console.error('Error checking if stock is in portfolio', error);
 }
 });
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
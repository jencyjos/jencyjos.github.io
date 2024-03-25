import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../services/stock.service';
import { MatDialog } from '@angular/material/dialog';

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
  searchResults: any;
  results: any;
  watchlist: string[] = []; 
  companyPeers : any[] =[];
  insiderSentimentData: any;
  
  historicalChartOptions!: Highcharts.Options;
  smaChartOptions!: Highcharts.Options;
  earningsChartOptions!: Highcharts.Options;
  recommendationChartOptions!: Highcharts.Options;

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private searchStateService: SearchStateService
  ) {}


  ngOnChanges(): void {
    if (this.searchQuery) {
      this.fetchStockDetails(this.searchQuery);
    }
  }


  //------------------------------------this is for the state - fix it
  ngOnInit() {
    this.searchStateService.searchResults$.subscribe(results => {
      this.searchResults = results;
    });
    this.checkIfFavorite(this.stockProfile.ticker);
  }

  ngOnDestroy() {
    // Unsubscribe from any subscriptions to prevent memory leaks
  }

  fetchStockDetails(ticker: string): void {
    this.checkIfFavorite(ticker); 

    this.stockService.getStockQuote(ticker).subscribe(data => {
      this.stockQuote = data;
      this.determineMarketStatus();
    });

    this.stockService.getStockProfile(ticker).subscribe(data => {
      this.stockProfile = data;
    });

    this.stockService.getTopNews(ticker).subscribe(data => {
      this.topNews = data;
    }, error => {
      console.error('Error fetching top news', error);
    });

    this.stockService.getCompanyPeers(ticker).subscribe(data => {
      this.companyPeers = data;
    }, error => {
      console.error('Error fetching company peers', error);
    });

    this.stockService.getCompanySentiment(ticker.toUpperCase()).subscribe(data => {
      this.insiderSentimentData = data;
      console.log(this.insiderSentimentData);
      console.log("this",ticker);
    }, error => {
      console.error('Error fetching companys insider sentiments', error);
    });
    
    this.stockService.getCompanySentiment(ticker).toPromise()

  // all charts here

  //historical chart - summary tab
    this.stockService.getHighCharts(ticker).subscribe(data => {
      this.drawPriceChart(data);
    }, error => {
      console.error('Error fetching top news', error);
    });


    //sma chart 
    this.stockService.getSmaCharts(ticker).subscribe(data => {
      this.drawSMAChart(data);
    }, error => {
      console.error('Error fetching top news', error);
    });

    this.stockService.getEarningsData(ticker).subscribe((data: EarningsData[]) => {
      this.drawEarningsChart(data);
    }, error => {
      console.error('Error fetching earnings chart', error);
    });


    //recommendation charts
    this.stockService.getRecommendationCharts(ticker).subscribe(data => {
      this.drawRecommendationChart(data);
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
        text: ` Hourly Price Variation`
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
            name: `AAAA`,
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

  drawRecommendationChart(insightsData: any): void {
    this.recommendationChartOptions = {

      accessibility: {
          enabled: false
      },
      chart: {
          type: 'column',
          backgroundColor: 'rgba(0, 0, 0, 0.05)'
      },
  
      yAxis: {
          title: {
              text: 'Analysis'
          },
          stackLabels: {
              enabled: false
          },
          opposite: false,
          lineWidth: 0,
          resize: {
              enabled: false
          }
      },
      title: {
          text: 'Recommendation Trends',
          align: 'center'
      },
      // tooltip: {
      //     headerFormat: '<b>{point.x}</b><br/>',
      //     pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
      //     split: true
      // },
  
  
  
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: true
              }
          }
      },
  
  
      xAxis: {
          categories: insightsData['recommendation'].xAxis
      },

  
      series: [{
          name: 'Strong Buy',
          data: insightsData['recommendation'].yAxis.strongBuy,
          type:'column',
          color: '#008000'
      }, {
          name: 'Buy',
          data: insightsData['recommendation'].yAxis.buy,
          type:'column',
          color: '#04af70'
      }, {
          name: 'Hold',
          data: insightsData['recommendation'].yAxis.hold,
          type:'column',
          color: '#a68004'
      },
      {
        name: 'Sell',
        data: insightsData['recommendation'].yAxis.sell,
        type:'column',
        color: '#f28500'
    },
    {
      name: 'Strong Sell',
      data: insightsData['recommendation'].yAxis.strongSell,
      type:'column',
      color: '#800080'
  }] 
  
  };
  
  };
 
  drawEarningsChart(earningsData: any): void {
    const actualData = earningsData.map((item: EarningsData) => item.actual !== null ? item.actual : 0);
    const estimateData = earningsData.map((item: EarningsData) => item.estimate !== null ? item.estimate : 0);
    const categories = earningsData.map((item: EarningsData) => `${item.period}\nSurprise: ${item.surprise}`);
    this.earningsChartOptions = {
      
        chart: {
            type: 'spline',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
        },
        accessibility: {
            enabled: false
        },
        title: {
            text: 'Historical EPS Suprises',
            align: 'center'
        },

        xAxis: {
          crosshair: true,
          categories: earningsData["earnings"].xAxis,
        },
        yAxis: {
            title: {
                text: 'Quarterly EPS'
            },
            opposite: false,
            lineWidth: 0,
            resize: {
                enabled: false
            }
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            spline: {
                marker: {
                    radius: 3
                }
            }
        },
        series: [{
            type: 'spline',
            name: 'Actual',
            marker: {
                symbol: 'circle'
            },
            data: earningsData["earnings"].yAxis.actual

        }, {
          type: 'spline',
          name: 'Estimate',
            marker: {
                symbol: 'diamond'
            },
            data: earningsData["earnings"].yAxis.estimate
        }]
    }
  };

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
            text: 'AAPL Historical'
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
                        'week',                         // unit name
                        [2]                             // allowed multiples
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
    
        this.marketOpen = difference < 5 * 60 * 1000;
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


  toggleWatchlist(ticker: string): void {
    // Toggle the visual state
    this.isFavorite = !this.isFavorite;

    // Call the StockService method to add/remove from watchlist
    this.stockService.toggleWatchlist(ticker).subscribe({
      next: (response) => {
        // Display a self-closing alert with the response message
        this.isFavorite = !this.isFavorite; 
        alert(response.message);
      },
      error: (error) => {
        console.error('Error updating watchlist', error);
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


  
}
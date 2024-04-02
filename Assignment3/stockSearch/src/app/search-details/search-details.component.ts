import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../services/stock.service';
import { MatDialog } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PortfolioService } from '../services/portfolio.service';
import { interval, Observable, of, Subscription } from 'rxjs';
import { switchMap, filter, startWith, catchError, tap } from 'rxjs/operators';

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
import { ReturnStatement, TaggedTemplateExpr } from '@angular/compiler';

HC_stock(Highcharts);
indicators(Highcharts);
vbpa(Highcharts);

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
  inPortfolio: boolean = false;
  marketOpen: boolean = false;
  topNews: any[] = [];
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions?: Highcharts.Options = {};
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  isFavorite: boolean = false;
  onFav: boolean = false;
  onUnfav: boolean = false;
  searchResults: any;
  results: any;
  watchlist: string[] = [];
  companyPeers: any[] = [];
  insiderSentimentData: any;
  lastUpdatedTime: string = "";
  tickerNotFound: boolean = false;
  currentTime: any;
  walletBalance: number = 0;
  stocks: any[] = [];
  stock: any;
  state: any;

  historicalChartOptions!: Highcharts.Options;
  smaChartOptions!: Highcharts.Options;
  earningsChartOptions!: Highcharts.Options;
  recommendationChartOptions!: Highcharts.Options;

  boughtSuccessfully: boolean = false;
  soldSuccessfully: boolean = false;

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
    this.setCurrentTime();
  }

  setCurrentTime() {
    const now = new Date();
    // this.currentTime = now;
    this.currentTime = formatDate(now, 'yyyy-MM-dd HH:mm:ss', 'en-US');
  }


  ngOnChanges(): void {
    if (this.searchQuery) {
      this.state = this.stockService.getState();
      if (this.state.ticker === null || this.state.ticker === undefined || this.searchQuery !== this.state.ticker) {
        if (this.autoUpdateInterval) {
          this.autoUpdateInterval.unsubscribe();
        }
        this.fetchStockDetails(this.searchQuery);
      }
      else {
        this.stockQuote = this.state.stockQuote;
        this.lastUpdatedTime = this.state.lastUpdatedTime;
        this.stockProfile = this.state.stockProfile;
        this.topNews = this.state.topNews;
        this.companyPeers = this.state.companyPeers;
        this.insiderSentimentData = this.state.insiderSentimentData;
        this.drawPriceChart(this.state.priceChartData,this.state.stockQuote);
        this.drawSMAChart(this.state.smaChartData);
        this.drawEarningsChart(this.state.earningsChartData);
        this.drawRecommendationChart(this.state.recommendationChartData);
        this.checkIfFavorite(this.stockProfile.ticker);
        this.checkInPortfolio(this.stockProfile.ticker);
        this.determineMarketStatus();
        this.setCurrentTime();
        this.startAutoUpdate(this.stockProfile.ticker);
      }
    }
  }

  ngOnInit() {

    this.searchStateService.searchResults$.subscribe(results => {
      this.searchResults = results;
      // this.state.searchResults = this.searchResults;
      // this.stockService.setState(this.state);

    });
    this.state.searchResults = this.searchResults;
    this.stockService.setState(this.state);
  }

  ngOnDestroy() {
    if (this.autoUpdateInterval) {
      this.autoUpdateInterval.unsubscribe();
    }
  }


  fetchStockDetails(ticker: string): void {
    // if(ticker==null){return};
    this.checkIfFavorite(ticker);
    this.checkInPortfolio(ticker);
    this.setCurrentTime();
    this.startAutoUpdate(ticker);
    this.state.ticker = ticker;
    this.stockService.setState(this.state);

    this.stockService.getStockQuote(ticker).subscribe(data => {
      this.stockQuote = data;
      const lastUpdate = new Date(this.stockQuote.t * 1000);
      this.lastUpdatedTime = formatDate(lastUpdate.getTime(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
      this.state.stockQuote = this.stockQuote;
      this.state.lastUpdatedTime = formatDate(lastUpdate.getTime(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
      this.stockService.setState(this.state);
      this.determineMarketStatus();

      let todayDate =  new Date(this.stockQuote.t * 1000)
      let fromDate = new Date(this.stockQuote.t * 1000)
      let tDate =  new Date(todayDate)
      tDate.setDate(todayDate.getDate()-1);
      fromDate.setDate(todayDate.getDate() - 1);

      this.stockService.getHighCharts(
        ticker, fromDate.toISOString().split('T')[0], todayDate.toISOString().split('T')[0]).subscribe(data => {
        this.state.priceChartData = data;
        this.stockService.setState(this.state);
        this.drawPriceChart(this.state.priceChartData, this.stockQuote);
      }, error => {
        console.error('Error fetching hourly chart', error);
      });
    });

    this.stockService.getStockProfile(ticker).subscribe(data => {
      // if (data==null) {return};
      this.stockProfile = data;
      this.state.stockProfile = this.stockProfile;
      this.stockService.setState(this.state);
      if (JSON.stringify(this.stockProfile) === '{}') {
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
      // console.log(this.insiderSentimentData);
      // console.log("this", ticker);
    }, error => {
      console.error('Error fetching companys insider sentiments', error);
    });

    this.stockService.getCompanySentiment(ticker).toPromise()

    // some charts here
    //sma chart 
    this.stockService.getSmaCharts(ticker).subscribe(data => {
      this.state.smaChartData = data;
      this.stockService.setState(this.state);
      this.drawSMAChart(this.state.smaChartData);
    }, error => {
      console.error('Error fetching sma chart', error);
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
      console.error('Error fetching recommendation charts', error);
    });

  }

  checkIfFavorite(ticker: string) {
    
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
  
    this.portfolioService.checkStockInPortfolio(ticker).subscribe({
      next: (isInPortfolio: boolean) => {
        this.inPortfolio = isInPortfolio;
       
      },
      error: (error) => {
        console.error('Error checking if stock is in portfolio', error);
      }
    });
  }

  drawPriceChart(stockData: any, stockQuote: any): void {
    this.historicalChartOptions = {
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
          color: stockQuote.c >= 0? "green": "red",
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
    const categories = recommendationData.map(data => data.period.slice(0,7));


    const series: Highcharts.SeriesOptionsType[] = [
      {
        name: 'Strong Buy',
        type: 'column',
        data: recommendationData.map(data => data.strongBuy),
        color: '#008000',
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
        name: 'Hold',
        type: 'column',
        data: recommendationData.map(data => data.hold),
        color: '#a68004',
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
        name: 'Strong Sell',
        type: 'column',
        data: recommendationData.map(data => data.strongSell),
        color: '#800080',
        stack: 'recommendations'
      },



    ];


    this.recommendationChartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'rgba(0, 0, 0, 0.05)'
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
          text: '#Analysis'
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
            enabled: true, 
            formatter: function () {
              return this.y; 
            }
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

    const categories = earningsData.map(item => `${item.period} <br> Surprise: ${item.surprise}`);

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
        categories: categories,
        labels: {
          style: {
            fontSize: '11px' 
          }
        }
      
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
        color: 'blue'
      }, {
        name: 'Estimate',
        type: 'spline',
        data: estimateData,
        color: 'lightblue'
      }]
    };

  }

  drawSMAChart(smaData: any): void {
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
      this.marketOpen = difference < 5 * 60 * 1000;
      // if (this.marketOpen == false) {
        this.lastUpdatedTime = formatDate(lastUpdate.getTime(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
      // }
    }
  }


  //FOR AUTO UPDATE
  fetchAllDetails(ticker: string) {
    console.log("fetching all details again for auto-update")
    this.setCurrentTime();
    return this.stockService.getStockQuote(ticker).pipe
    (
      switchMap(stockQuote => {
        console.log("hellooooo freaka", stockQuote);
        this.stockQuote = stockQuote;
        this.state.stockQuote = this.stockQuote;
        this.stockService.setState(this.state);
        this.determineMarketStatus();
        this.lastUpdatedTime = formatDate(stockQuote.t * 1000, 'yyyy-MM-dd HH:mm:ss', 'en-US');
        this.state.lastUpdatedTime = this.lastUpdatedTime;
        return this.stockService.getStockProfile(ticker);
      }),
      switchMap(stockProfile => {
        this.stockProfile = stockProfile;
        this.state.stockProfile = this.stockProfile;
        this.stockService.setState(this.state);
        if (JSON.stringify(this.stockProfile) === '{}') {
          this.tickerNotFound = true;
        }
        return new Observable();
      })
    );
    
  }

  startAutoUpdate(ticker: string): void {
    // console.log("starting auto update")
    const fifteenSecondsInterval$ = interval(15000).pipe(
      startWith(0),
      filter(() => this.marketOpen),
      switchMap(() => this.fetchAllDetails(ticker))
    );
    if(fifteenSecondsInterval$ != null){
      this.autoUpdateInterval = fifteenSecondsInterval$?.subscribe();
    }
  }

  openNewsModal(newsArticle: NewsArticle): void {
    const dialogRef = this.dialog.open(NewsDetailModalComponent, {
      width: '340px',
      height: '300px',
      data: newsArticle
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }



  toggleWatchlist(ticker: string): void {
    this.stockService.toggleWatchlist(ticker).subscribe({
      next: (response) => {
        if (this.isFavorite) {
          this.onUnfav = true;
          setTimeout(() => {
            this.onUnfav = false;
          }, 5000);
        }
        else if (!this.isFavorite) {
          this.onFav = true;
          setTimeout(() => {
            this.onFav = false;
          }, 5000);
        }
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

    const buyModalRef = this.modalService.open(BuyModalComponent);
    buyModalRef.componentInstance.stock = { ticker: this.stockProfile.ticker, name: this.stockProfile.name, currentPrice: this.stockQuote.c }
    // console.log(buyModalRef.componentInstance.stock)
    buyModalRef.result.then((result) => {
      if (result && result.success == true) {
        // console.log("bought ", this.stockProfile.ticker)
        this.loadPortfolio();
        this.loadWalletBalance();
        this.boughtSuccessfully = true;
        setTimeout(() => {
          this.boughtSuccessfully = false
        }, 5000);
      }
    }, (reason) => {
      // console.log("oh crap", reason)
    });
  }

  openSellModal(): void {
    const modalRef = this.modalService.open(SellModalComponent);
    this.portfolioService.getStockByTicker(this.stockProfile.ticker).subscribe({
      next: (stock: Stock | null) => {
        if (stock) {
          // console.log("In sell", stock)
          modalRef.componentInstance.stock = { ticker: stock.ticker, name: stock.name, averageCost: stock.averageCost, currentPrice: this.stockQuote.c, shares: stock.shares }
          modalRef.result.then((result) => {
            if (result && result.success == true) {
              // console.log("sold ", this.stockProfile.ticker)
              this.loadPortfolio();
              this.loadWalletBalance();
              this.soldSuccessfully = true;
              setTimeout(() => {
                this.soldSuccessfully = false
              }, 5000);
            }
          }, (reason) => {
            console.log("reason due to we coulnt sell", reason)
          });
        } else {
          console.error('Stock not found: ', this.stockProfile.ticker);
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
      (data: any) => {
        this.stocks = [...data.stocks];;
        this.fetchStockDetails(this.searchQuery);
        this.fetchCurrentPrice();
      },
      (error: any) => {
        console.error('Error fetching portfolio', error);
      }
    );
  }


  loadWalletBalance(): void {
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
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../services/stock.service';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting'; 
import { NewsDetailModalComponent } from '../news-detail-modal-component/news-detail-modal-component.component';

HC_exporting(Highcharts);

interface NewsArticle {
  headline: string;
  image: string;
  // ... other properties
}

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.css']
})
export class SearchDetailsComponent implements OnInit {
  ticker: string = '';
  stockProfile: any;
  stockQuote: any;
  inPortfolio: boolean = false; // Determine if stock is in portfolio
  marketOpen: boolean = false; // Determine if market is open
  topNews : any[] =[];
  Highcharts: typeof Highcharts = Highcharts; // required
  chartOptions?: Highcharts.Options = {}; 
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;


  

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    public dialog: MatDialog
  ) {}

  
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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
    this.ticker = params['ticker'];

    if (this.ticker === null) {
      throw new Error('Ticker parameter is missing');
    }

    this.stockService.getTopNews(this.ticker).subscribe(data => {
      this.topNews = data;
    }, error => {
      console.error('Error fetching top news', error);
    });

    this.stockService.getStockQuote(this.ticker).subscribe(data => {
    this.stockQuote = data;
      console.log(this.stockQuote);
  });

    this.stockService.getStockProfile(this.ticker).subscribe(data => {
      this.stockProfile = data;
      this.determineMarketStatus();
      console.log(this.stockProfile);
    });

    this.chartOptions = {
      // Highcharts options go here
      series: [
        {
          data: [1,2,3,4],
          type: 'line'
          // Other series options...
        }
        // ... more series if necessary
      ],
      // ... other chart options
    };

    // When your data is ready, create the chart
    //setTimeout(() => Highcharts.chart(this.chartContainer.nativeElement, this.chartOptions), 0);


  });
  }


    // Check if stock is in portfolio
    // You would typically have a service to check your portfolio
    // This is just a placeholder implementation
    // this.inPortfolio = this.portfolioService.checkStock(ticker);
  
    determineMarketStatus() {
      // Logic to determine if market is open based on stockQuote data
      // This could involve checking the current time against the 't' property
      // in the stockQuote object, which would require some date conversion
      // Assuming stockQuote.t is a timestamp
      let currentTime = new Date().getTime();
      let marketCloseTime = new Date(this.stockQuote.t).getTime();
      this.marketOpen = currentTime < marketCloseTime;
    }

    ngAfterViewInit(): void {
      // Ensure ngAfterViewInit is implemented by adding the AfterViewInit interface to your component class.
      if (this.chartContainer.nativeElement) {
        // Only proceed if chartContainer and chartOptions are both defined.
        setTimeout(() => {
          //Highcharts.chart(this.chartContainer.nativeElement, this.chartOptions);
        }, 0);
      }
    }

  
}

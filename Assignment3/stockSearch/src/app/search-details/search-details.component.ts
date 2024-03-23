import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  // stockProfile: any;
  // stockQuote: any;
  @Input() stockProfile: any;
  @Input() stockQuote: any;
  inPortfolio: boolean = false; // Determine if stock is in portfolio
  marketOpen: boolean = false; // Determine if market is open
  topNews : any[] =[];
  Highcharts: typeof Highcharts = Highcharts; // required
  chartOptions?: Highcharts.Options = {}; 
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  isFavorite: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    public dialog: MatDialog
  ) {}

 
  ngOnInit(): void {
    this.route.params.subscribe(params => {
    this.ticker = params['ticker'];

    if (!this.ticker)  {
      throw new Error('Ticker parameter is missing');
    }

    this.stockService.getStockProfile(this.ticker).subscribe(data => {
      this.stockProfile = data;
      //console.log(this.stockProfile);
    });

    this.stockService.getStockQuote(this.ticker).subscribe(data => {
      this.stockQuote = data;
      this.determineMarketStatus(); // Determine market status with the new quote data
    }, error => {
      console.error('Error fetching stock quote', error);
    });

    this.stockService.getTopNews(this.ticker).subscribe(data => {
      this.topNews = data;
    }, error => {
      console.error('Error fetching top news', error);
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
    
    ngAfterViewInit(): void {
      // Ensure ngAfterViewInit is implemented by adding the AfterViewInit interface to your component class.
      if (this.chartContainer.nativeElement) {
        // Only proceed if chartContainer and chartOptions are both defined.
        setTimeout(() => {
          //Highcharts.chart(this.chartContainer.nativeElement, this.chartOptions);
        }, 0);
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
        alert(response.message);
      },
      error: (error) => {
        console.error('Error updating watchlist', error);
      }
    });
  }
}
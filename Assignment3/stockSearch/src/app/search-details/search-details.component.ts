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

export class SearchDetailsComponent {
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

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    public dialog: MatDialog
  ) {}


  ngOnChanges(): void {
    if (this.searchQuery) {
      this.fetchStockDetails(this.searchQuery);
    }
  }

  fetchStockDetails(ticker: string): void {
    this.stockService.getStockQuote(ticker).subscribe(data => {
      this.stockQuote = data;
    });

    this.stockService.getStockProfile(ticker).subscribe(data => {
      this.stockProfile = data;
      this.determineMarketStatus();
    });

    this.stockService.getTopNews(ticker).subscribe(data => {
      this.topNews = data;
    }, error => {
      console.error('Error fetching top news', error);
    });

  
    
    // Additional logic for fetching chart data, if needed
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
        alert(response.message);
      },
      error: (error) => {
        console.error('Error updating watchlist', error);
      }
    });
  }
}
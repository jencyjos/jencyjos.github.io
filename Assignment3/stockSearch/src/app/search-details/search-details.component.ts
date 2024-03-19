import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrl: './search-details.component.css'
  
})
export class SearchDetailsComponent implements OnInit {
  ticker: string = '';
  stockProfile: any;
  stockQuote: any;
  inPortfolio: boolean = false; // Determine if stock is in portfolio
  marketOpen: boolean = false; // Determine if market is open

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService
  ) {}

  // ngOnInit(): void {
  //   const ticker = this.route.snapshot.paramMap.get('ticker');
  //   if (ticker === null) {
  //     throw new Error('Ticker parameter is missing');
  //   }
  
  //   this.ticker = ticker;
  //   console.log(`Initiating search for ticker: ${this.ticker}`);


  //       // If you need profile data:
  //   this.stockService.getStockProfile(this.ticker).subscribe(
  //     data => { this.stockData = data; },
  //     error => { console.error('Error fetching stock profile', error); }
  //   );

  //   // If you need quote data:
  //   this.stockService.getStockQuote(this.ticker).subscribe(
  //     data => { this.stockQuote = data; },
  //     error => { console.error('Error fetching stock quote', error); }
  //   );

  // }


      ngOnInit(): void {
        this.route.params.subscribe(params => {
        this.ticker = params['ticker'];

        if (this.ticker === null) {
          throw new Error('Ticker parameter is missing');
        }

        this.stockService.getStockQuote(this.ticker).subscribe(data => {
        this.stockQuote = data;
          console.log(this.stockQuote);
      });

        this.stockService.getStockProfile(this.ticker).subscribe(data => {
          this.stockProfile = data;
          this.determineMarketStatus();
          console.log(this.stockProfile);
        });
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

  
}

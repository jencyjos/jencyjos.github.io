import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrl: './search-details.component.css'
  
})
export class SearchDetailsComponent implements OnInit {
  // ticker: string;
  ticker: string = '';
  stockData: any;
  stockQuote: any;

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
      this.stockService.getStockQuote(this.ticker).subscribe(data => {
        this.stockQuote = data;
        console.log(this.stockQuote);
      });

      this.stockService.getStockProfile(this.ticker).subscribe(data => {
        this.stockData = data;
        console.log(this.stockData);
      });
    });
  }
}
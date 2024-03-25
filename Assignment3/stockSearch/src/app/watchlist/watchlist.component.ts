import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service'; 
import { Router } from '@angular/router';


@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent {
  watchlist: any[] = [];
  loading: boolean = true; 

  constructor(private stockService: StockService, private router: Router) {}

  ngOnInit() {
    this.loadWatchlist();
  }

//   loadWatchlist() {
//     this.stockService.getWatchlist().subscribe(data => {
//       this.watchlist = data;
//       this.loading = false;
//     }, error => {
//       console.error('Error loading watchlist', error);
//       this.loading = false;
//     });
//   }

// }

loadWatchlist() {
  this.stockService.getWatchlist().subscribe(data => {
    this.watchlist = data.map(item => {
      // Here you should include the logic to fetch 'c', 'd', and 'dp' for each item
      // This is just an example, you should replace with actual logic/data
      return {
        ...item,
        c: item.currentPrice, // 'c' stands for current price
        d: item.change, // 'd' stands for change in price
        dp: ((item.change / item.previousClose) * 100).toFixed(2) // 'dp' stands for change percentage
      };
    });
    this.loading = false;
  }, error => {
    console.error('Error loading watchlist', error);
    this.loading = false;
  });
}

navigateToDetails(ticker: string) {
  this.router.navigateByUrl(`/details/${ticker}`); // Navigate to the details route
}

removeFromWatchlist(ticker: string, index: number) {
  // Implement the logic to remove an item from the watchlist
  // You will need to prevent event propagation here since this click is nested inside the li element
}
}

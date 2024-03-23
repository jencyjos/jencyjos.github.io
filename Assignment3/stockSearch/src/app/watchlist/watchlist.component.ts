import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service'; 

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent {
  watchlist: any[] = [];

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.stockService.getWatchlist().subscribe(data => {
      this.watchlist = data;
    }, error => {
      console.error('Error loading watchlist', error);
    });
  }

}

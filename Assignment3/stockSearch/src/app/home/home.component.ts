import { Component } from '@angular/core';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  searchQuery: string = '';
  searchResults: any;
  isNavbarCollapsed = true;

  constructor(private stockService: StockService) { }

  onSearch(): void {
    if (!this.searchQuery) {
      console.log("No search query");
      return;
    }
    console.log("Searching for", this.searchQuery);
    this.stockService.getStockDetails(this.searchQuery).subscribe(data => {
      this.searchResults = data;
    });
  }

  onClear(): void {
    this.searchQuery = '';
    this.searchResults = null;
  }
}
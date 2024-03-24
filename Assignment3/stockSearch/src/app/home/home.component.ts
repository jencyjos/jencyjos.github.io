import { Component } from '@angular/core';
import { StockService } from '../services/stock.service';
import { SearchStateService } from '../services/SearchState.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  searchQuery: string = '';
  searchResults: any;

  constructor(private stockService: StockService,
    private searchStateService: SearchStateService) { }

  onSearch(): void {
    if (!this.searchQuery) {
      console.log("No search query");
      return;
    }
    console.log("Searching for", this.searchQuery);
    this.stockService.getStockDetails(this.searchQuery).subscribe(data => {
      this.searchResults = data;
      this.searchStateService.setSearchResults(data);
    });
  }

  onClear(): void {
    this.searchQuery = '';
    this.searchResults = null;
  }
}
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']

})

export class HomeComponent {
  searchQuery: string = '';
  isNavbarCollapsed = true;

  constructor(private stockService: StockService, private router: Router) {}

  onSearch(): void {
    if (!this.searchQuery) {
      // Handle empty search query
      console.log("no search query")
      return;
    }
    console.log("searching for",this.searchQuery);
    this.router.navigate(['/search', this.searchQuery]);
    // Perform the search using the searchQuery
    // This usually involves calling a service that handles HTTP requests
  }

  onClear(): void {
    this.searchQuery = ''; // Clear the search input
    console.log("cleared");
    // Clear any search results if necessary
  }

}

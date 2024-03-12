import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
  searchQuery: string = '';

  isNavbarCollapsed = true;

  constructor() {
    // Inject any necessary services
  }

  onSearch(): void {
    if (!this.searchQuery) {
      // Handle empty search query
      console.log("no search query")
      return;
    }
    console.log("searching for",this.searchQuery)
    // Perform the search using the searchQuery
    // This usually involves calling a service that handles HTTP requests
  }

  onClear(): void {
    this.searchQuery = ''; // Clear the search input
    console.log("cleared");
    // Clear any search results if necessary
  }

}

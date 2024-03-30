import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';
import { SearchStateService } from '../services/SearchState.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  searchQuery: string = '';
  state: any;
  searchResults: any;
  autocompleteResults : any[] =[];

  constructor(private stockService: StockService,
    private searchStateService: SearchStateService) { }

  ngOnInit() {
    console.log("Fuckedd uppp");
    this.state = this.stockService.getState();
    this.searchQuery = this.state.ticker;
    this.onSearch()
  }

  onSearch(): void {
    if (!this.searchQuery) {
      console.log("No search query");
      this.autocompleteResults = [];
      return;
    }
    console.log("Searching for", this.searchQuery);
    this.stockService.getStockDetails(this.searchQuery).subscribe(data => {
      this.searchResults = data;
      this.searchStateService.setSearchResults(data);
    });
  }
  onSearchChange(): void {
    if (this.searchQuery) {
      this.stockService.getAutocompleteResults(this.searchQuery).subscribe(data => {
        this.autocompleteResults = data;
      });
    } else {
      this.clearAutocompleteResults();
    }
  }


  // onSearchChange(): void {
  //   if (this.searchQuery) {
  //     this.stockService.getAutocompleteResults(this.searchQuery).subscribe(data => {
  //       this.autocompleteResults = data;
  //     });
  //   } else {
  //     this.autocompleteResults = [];
  //     this.onClear();
  //   }
  // }
  
  selectSuggestion(suggestion: any): void {
    this.searchQuery = suggestion.symbol;
    this.autocompleteResults = [];
    this.onSearch();
  }

 onClear(): void {
    this.searchQuery = '';
    this.searchResults = null;
    this.autocompleteResults = [];
    this.stockService.setState({});
    this.clearAutocompleteResults();

  }
  clearAutocompleteResults(): void {
    this.autocompleteResults = [];
  }
}
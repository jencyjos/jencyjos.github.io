
import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';
import { SearchStateService } from '../services/SearchState.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  searchQuery: string = '';
  currentTicker:string ='';
  state: any;
  searchResults: any;
  acLoading: boolean = false;
  autocompleteResults : any[] =[];
  showAuto: boolean = false;
  control = new FormControl();

  constructor(private stockService: StockService,
    private searchStateService: SearchStateService,
    private route :ActivatedRoute, private router: Router) { 
      this.route.params.subscribe(params => {
        this.searchQuery = params['ticker'];
        if (this.searchQuery){
          this.autocompleteResults = [];
          this.control.setValue(this.searchQuery);
          this.onSearch();
        }
  
      });
    }
  ngOnInit() {
    this.searchResults = {}
    console.log("Fuckedd uppp");
    this.control.valueChanges.subscribe(
      value => {
        if(value){
          this.onSearchChange(value)
        }
      }
    )

  }

  onSelect(){
    this.router.navigate(['/', 'search', this.control.value]);
  }
  onSearch(): void {
    this.searchQuery = this.control.value;
    console.log("onsearch: ", this.searchQuery)
    if (!this.searchQuery) {
      console.log("No search query");
      this.autocompleteResults = [];
      return;
    }
    this.showAuto = false;
    console.log("Searching for", this.searchQuery);
    this.stockService.getStockDetails(this.searchQuery).subscribe(data => {
      this.searchResults = data;
      this.searchStateService.setSearchResults(data);
    });
  }
  onSearchChange(value: string): void {
    console.log("keydown");
    this.showAuto = true;
    this.acLoading =true;
    this.autocompleteResults=[];
    if (value) {
      this.stockService.getAutocompleteResults(value).subscribe(data => {
        this.acLoading = false;
        this.autocompleteResults = data;
      });
    } else {
      this.clearAutocompleteResults();
    }
  }

  // selectSuggestion(suggestion: any): void {
  //   this.searchQuery = suggestion.symbol;
  //   this.autocompleteResults = [];
  //   this.onSearch();
  // }

 onClear(): void {
    this.searchQuery = '';
    this.searchResults = null;
    this.autocompleteResults = [];
    this.stockService.setState({});
    this.clearAutocompleteResults();
    this.router.navigate(['/', 'search', 'home'])
  }

  clearAutocompleteResults(): void {
    this.autocompleteResults = [];
  }
}

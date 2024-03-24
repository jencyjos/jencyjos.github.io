import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private searchResultsSource = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSource.asObservable();

  constructor() { }

  setSearchResults(results: any[]) {
    this.searchResultsSource.next(results);
  }

  // getSearchResults(): any[] {
  //   return this.searchResults;
  // }
}

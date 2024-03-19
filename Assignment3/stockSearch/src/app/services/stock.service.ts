import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class StockService {
    private profileUrl = 'http://localhost:3000/api/stock/profile'; 
    private quoteUrl = 'http://localhost:3000/api/stock/quote'; 
    private autocompleteUrl = 'http://localhost:3000/api/autocomplete';
    constructor(private http: HttpClient) { }

    getAutocompleteResults(query: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.autocompleteUrl}/autocomplete/${query}`);
    }
  
    getStockProfile(ticker: string): Observable<any> {
      console.log(`Fetching profile for ticker: ${ticker}`);
      return this.http.get(`${this.profileUrl}/${ticker}`);
    }
  
    getStockQuote(ticker: string): Observable<any> {
      console.log(`Fetching quote for ticker: ${ticker}`);
      return this.http.get(`${this.quoteUrl}/${ticker}`);
    }
  }
  

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
    private newsUrl = 'http://localhost:3000/api/stock/news';
    constructor(private http: HttpClient) { }


    getTopNews(ticker: string): Observable<any[]> {
      console.log(`Fetching news for ticker: ${ticker}`);
      return this.http.get<any[]>(`${this.newsUrl}/${ticker}`);
    }

    getAutocompleteResults(query: string): Observable<any[]> {
      console.log(`Fetching autocomplete for query: ${query}`);
      return this.http.get<any[]>(`${this.autocompleteUrl}/${query}`);
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
  

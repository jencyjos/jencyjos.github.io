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
    private apiUrl = 'http://localhost:3000';
    private detailsUrl= 'http://localhost:3000/api/stock/details';


    constructor(private http: HttpClient) { }

    getStockDetails(ticker: string): Observable<any> {
      console.log(`Fetching details for ticker: ${ticker}`);
      return this.http.get<any>(`${this.detailsUrl}/${ticker}`);
    }

    toggleWatchlist(ticker: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/watchlist/toggle`, { ticker });
    }

  
    getWatchlist(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/api/watchlist`);
    }


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

    buyStock(ticker: string, quantity: number): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/buy`, { ticker, quantity });
    }
  
    sellStock(ticker: string, quantity: number): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/sell`, { ticker, quantity });
    }
    // getUserWallet(): Observable<number> {
    //   // This should be an API call to get the actual wallet amount from the database.
    //   return of(this.userWallet);

      
    }
  

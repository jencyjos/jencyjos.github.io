import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class StockService {
    private stateData = {}

    getState() {
      console.log("I am here 1", this.stateData);
      return this.stateData;
    }

    setState(obj: any){
      console.log("I am here", obj);
      this.stateData = obj;
    }

    private apiUrl = 'http://localhost:3000';
    private profileUrl = 'http://localhost:3000/api/stock/profile'; 
    private quoteUrl = 'http://localhost:3000/api/stock/quote'; 
    private autocompleteUrl = 'http://localhost:3000/api/autocomplete';
    private newsUrl = 'http://localhost:3000/api/stock/news';
    private detailsUrl= 'http://localhost:3000/api/stock/details';
    private smaChartsUrl='http://localhost:3000/api/stock/sma';
    private chartsUrl='http://localhost:3000/api/stock/historical';
    private earningsChartsUrl='http://localhost:3000/api/stock/earnings';
    private recommendationChartsUrl='http://localhost:3000/api/stock/recommendation';
    private insiderUrl='http://localhost:3000/api/stock/insider-sentiment';
    private peersUrl='http://localhost:3000/api/peers';


    constructor(private http: HttpClient) { }


    getCompanySentiment(ticker: string): Observable<any> {
      return this.http.get<any>(`${this.insiderUrl}/${ticker}`);
    }

    getCompanyPeers(ticker: string): Observable<any> {
      return this.http.get<any>(`${this.peersUrl}/${ticker}`);
    }


    getStockDetails(ticker: string): Observable<any> {
      // console.log(`Fetching details for ticker: ${ticker}`);
      return this.http.get<any>(`${this.detailsUrl}/${ticker}`);
    }

    toggleWatchlist(ticker: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/watchlist/toggle`, { ticker });
    }

  
    getWatchlist(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/api/watchlist`);
    }


    getHighCharts(ticker: string): Observable<any[]> {
      // console.log(`Fetching charts for ticker: ${ticker}`);
      return this.http.get<any[]>(`${this.chartsUrl}/${ticker}`);
    }

    getSmaCharts(ticker: string): Observable<any[]> {
      // console.log(`Fetching SMA for ticker: ${ticker}`);
      return this.http.get<any[]>(`${this.smaChartsUrl}/${ticker}`);
    }

    getEarningsData(ticker: string): Observable<any[]> {
      // console.log(`Fetching charts for ticker: ${ticker}`);
      return this.http.get<any[]>(`${this.earningsChartsUrl}/${ticker}`);
    }

    getRecommendationCharts(ticker: string): Observable<any[]> {
      // console.log(`Fetching recommendation for ticker: ${ticker}`);
      return this.http.get<any[]>(`${this.recommendationChartsUrl}/${ticker}`);
    }

    getTopNews(ticker: string): Observable<any[]> {
      // console.log(`Fetching nEWS for ticker: ${ticker}`);
      return this.http.get<any[]>(`${this.newsUrl}/${ticker}`);
    }

    getAutocompleteResults(query: string): Observable<any[]> {
      // console.log(`Fetching autocomplete for query: ${query}`);
      return this.http.get<any[]>(`${this.autocompleteUrl}/${query}`);
    }
  
    getStockProfile(ticker: string): Observable<any> {
      // console.log(`Fetching profile for ticker: ${ticker}`);
      return this.http.get(`${this.profileUrl}/${ticker}`);
    }
  
    getStockQuote(ticker: string): Observable<any> {
      // console.log(`Fetching quote for ticker: ${ticker}`);
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
  

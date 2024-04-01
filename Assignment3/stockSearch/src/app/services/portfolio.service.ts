
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../../../../backend/models/stock.model'; 
import { map } from 'rxjs/operators';

interface TransactionResponse {
  success: boolean;
  message?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  private apiUrl = 'http://localhost:3000'; 
  private stockDetailsUrl = 'http://localhost:3000/api/stock/details'
  private stocksQuoteURL = 'http://localhost:3000/api/stock/quote'
  constructor(private http: HttpClient) { }


  getPortfolio(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/api/portfolio`);
  }

 
  getPortfolioInOrig(): Observable<{ stocks: Stock[]}> {
    return this.http.get<{ stocks: Stock[]}>(`${this.apiUrl}/api/portfolio`);
  }

  checkStockInPortfolio(ticker: string): Observable<boolean> {
    return this.getPortfolioInOrig().pipe(
       map(response => response.stocks.some(stock => stock.ticker === ticker))
    );
  }
  
  getStockByTicker(ticker: string): Observable<Stock | null> {
    return this.getPortfolioInOrig().pipe(
      map(response => response.stocks.find(stock => stock.ticker === ticker) || null)
    );
  }

  buyStock(ticker: string, name: string, quantity: number, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/buy`, { ticker, name, quantity, price });
  }

  sellStock(ticker: string, quantity: number, currentPrice: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/sell`, {ticker , quantity, currentPrice });
  }

  getWalletBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/api/wallet`);
  }

  getStockDetails(ticker: string): Observable<any> {
    return this.http.get<any>(`${this.stockDetailsUrl}/${ticker}`);
  }

  getStockPrice(ticker: string): Observable<any> {
    return this.http.get<any>(`${this.stocksQuoteURL}/${ticker}`);
  }
}

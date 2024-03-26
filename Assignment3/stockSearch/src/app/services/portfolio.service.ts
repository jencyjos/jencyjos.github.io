// src/app/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../../../../backend/models/stock.model'; // Path might differ based on where you place your model
import { map } from 'rxjs/operators';

interface TransactionResponse {
  success: boolean;
  message?: string;
  // Add any other relevant fields that your API might return
}
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  private apiUrl = 'http://localhost:3000'; 
  constructor(private http: HttpClient) { }

  // Get the current portfolio
  getPortfolio(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/portfolio`);
  }

  checkStockInPortfolio(ticker: string): Observable<boolean> {
    return this.getPortfolio().pipe(
      map(stocks => stocks.some(stock => stock.ticker === ticker))
      // map((stocks: Stock[]) => stocks.some((stock: Stock) => stock.ticker === ticker))
    );
  }

  // Buy stock
//   buyStock(stock: Stock, quantity: number): Observable<any> {
    buyStock(ticker: string, quantity: number): Observable<any> {
    // Replace 'any' with a more specific type for the response if known
    return this.http.post(`${this.apiUrl}/buy`, { ticker, quantity });
  }

  // Sell stock
  sellStock(stockId: string, quantity: number): Observable<any> {
    // Replace 'any' with a more specific type for the response if known
    return this.http.post(`${this.apiUrl}/sell`, { stockId, quantity });
  }

  // Method to fetch the user's wallet balance
  getWalletBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/api/wallet`);
  }
}

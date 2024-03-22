// src/app/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../models/stock.model'; // Path might differ based on where you place your model

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:3000'; // Replace with the URL of your backend

  constructor(private http: HttpClient) { }

  // Get the current portfolio
  getPortfolio(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/portfolio`);
  }

  // Buy stock
  buyStock(stock: Stock, quantity: number): Observable<any> {
    // Replace 'any' with a more specific type for the response if known
    return this.http.post(`${this.apiUrl}/buy`, { stock, quantity });
  }

  // Sell stock
  sellStock(stockId: string, quantity: number): Observable<any> {
    // Replace 'any' with a more specific type for the response if known
    return this.http.post(`${this.apiUrl}/sell`, { stockId, quantity });
  }

  // Additional methods as needed...
}

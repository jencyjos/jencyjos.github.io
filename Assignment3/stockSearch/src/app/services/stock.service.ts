import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = 'http://localhost:3000/api/stock'; // Use your backend API URL

  constructor(private http: HttpClient) { }

  getStockQuote(ticker: string): Observable<any> {
    console.log(`Fetching quote for ticker: ${ticker}`);
    return this.http.get(`${this.baseUrl}/quote/${ticker}`);
  }
}

import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service'; 
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';


@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent {
  watchlist: any[] = [];
  loading: boolean = true; 

  constructor(private stockService: StockService, private router: Router) {}

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.stockService.getWatchlist().subscribe(data => {
      const detailsObservables = data.map(item => {
        return forkJoin({
          quote: this.stockService.getStockQuote(item.ticker).pipe(
            catchError(error => {
              console.error(`Error fetching quote for ${item.ticker}`, error);
              return of(null); 
            })
          ),
          details: this.stockService.getStockDetails(item.ticker).pipe(
            catchError(error => {
              console.error(`Error fetching name for ${item.ticker}`, error);
              return of(null);
            })
          )
        });
      });

      forkJoin(detailsObservables).subscribe(results => { 
        this.watchlist = results.map((result, index) => {
          if (!result.quote || !result.details) {
            return { ...data[index], c: undefined, d: undefined, dp: undefined, name: 'Unknown' };
          }
          return {
            ...data[index],
            c: result.quote.c,
            d: result.quote.d,
            dp: ((result.quote.d / result.quote.pc) * 100).toFixed(2),
            name: result.details.name 
          };
        });

        this.loading = false;
      }, error => {
        console.error('Error loading watchlist', error);
        this.loading = false;
      });
    });
  }



  navigateToDetails(ticker: string) {
    const url = `/search/${ticker}`; 
    this.router.navigateByUrl(`search/${ticker}`);
  }

  removeFromWatchlist(event: MouseEvent, ticker: string, index: number) {
    event.stopPropagation()
  this.stockService.toggleWatchlist(ticker).subscribe({
    next: () => {
      // console.log(`${ticker} removed from watchlist`);
      this.watchlist.splice(index, 1);
    },
    error: (error) => {
      console.error(`Error removing ${ticker} from watchlist:`, error);
    }
  });
  }
}

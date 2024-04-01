import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

enum LoadingState {
  Complete = 'complete',
  InProgress = 'in_progress',
}

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})

export class WatchlistComponent {
  LoadingState = LoadingState;
  watchlist: any[] = [];
  loading: LoadingState = LoadingState.InProgress;

  constructor(private stockService: StockService, private router: Router) { }

  ngOnInit() {
    this.loadWatchlist();
  }


  loadWatchlist() {
    this.stockService.getWatchlist().subscribe(data => {
      if (!data.length) {
        this.loading = LoadingState.Complete;
        return; // Exit the method early since there's nothing to process
      }
      const detailsObservables = data.map(item => {
        return forkJoin({
          quote: this.stockService.getStockQuote(item.ticker).pipe(
            catchError(error => {
              console.error(`Error fetching quote for ${item.ticker}`, error);
              return of(null); // Use an empty object to indicate failure
            })
          ),
          details: this.stockService.getStockDetails(item.ticker).pipe(
            catchError(error => {
              console.error(`Error fetching name for ${item.ticker}`, error);
              return of(null); // Use an empty object to indicate failure
            })
          )
        });
      });

      forkJoin(detailsObservables).subscribe(results => {
        this.watchlist = results.map((result, index) => {
          if (!result.quote || !result.details) {
            // Handle the case where either the quote or the name could not be fetched
            this.loading = LoadingState.Complete;
            return { ...data[index], c: undefined, d: undefined, dp: undefined, name: 'Unknown' };

          }
          this.loading = LoadingState.Complete;
          return {
            ...data[index],
            c: result.quote.c,
            d: result.quote.d,
            dp: ((result.quote.d / result.quote.pc) * 100).toFixed(2),
            name: result.details.name // assuming 'name' is the property containing the stock's name
          };
        });

      }, error => {
        this.loading = LoadingState.Complete;
        console.error('Error loading watchlist', error);
      });
    });
  }



  navigateToDetails(ticker: string) {
    const url = `/search/${ticker}`;
    // window.open(url, '_blank'); Open in a new tab
    this.router.navigateByUrl(`search/${ticker}`); // Navigate to the details route
  }

  removeFromWatchlist(event: MouseEvent, ticker: string, index: number) {
    event.stopPropagation()
    // Call a service method to remove the ticker from the watchlist
    this.stockService.toggleWatchlist(ticker).subscribe({
      next: () => {
        console.log(`${ticker} removed from watchlist`);
        // Optionally, update the local component state to reflect the change
        this.watchlist.splice(index, 1);
        // If you have a separate array or object managing the display of watchlist items,
        // you should update it here to reflect the removal.
      },
      error: (error) => {
        console.error(`Error removing ${ticker} from watchlist:`, error);
        // Handle any errors, such as displaying an error message to the user
      }
    });
  }
}


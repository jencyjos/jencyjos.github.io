import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service';
import { BuyModalComponent } from '../buy-modal/buy-modal.component';
import { SellModalComponent } from '../sell-modal/sell-modal.component';
import { Stock } from '../../../../backend/models/stock.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StockService } from '../services/stock.service';
import { forkJoin, tap, catchError, of } from 'rxjs';

enum LoadingState {
  Complete = 'complete',
  InProgress = 'in_progress',
}
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  stocks: any[] = [];
  walletBalance: number = 25000; 
  LoadingState = LoadingState;
  loading: LoadingState = LoadingState.InProgress;
  boughtSuccessfully: boolean = false;
  soldSuccessfully: boolean = false;
  stockProcessed: string = ""

  constructor(
    private portfolioService: PortfolioService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef) { }


  loadAgain(): void {
    forkJoin({
      portfolio: this.loadPortfolio(),
      walletBalance: this.loadWalletBalance()
    }).subscribe({
      next: (results) => {
        this.loading = LoadingState.Complete;
      },
      error: (error) => {
        console.error('error occurred while loading portfolio and wallet balance', error);
        this.loading = LoadingState.Complete;
      }
    });
  }

  ngOnInit(): void {
    this.loadAgain()
  }

  fetchStockDetails(): void {
    for (let stock of this.stocks) {
      this.portfolioService.getStockDetails(stock.ticker).subscribe(
        (data: any) => {
          stock.name = data.name;
        },
        (error: any) => {
          console.error('Error fetching stock details', error);
        }
      );
    }
  }

  fetchCurrentPrice(): void {
    for (let stock of this.stocks) {
      this.portfolioService.getStockPrice(stock.ticker).subscribe(
        (data: any) => {
          stock.currentPrice = data.c;
        },
        (error: any) => {
          console.error('Error fetching stock details', error);
        }
      );
    }
  }

  loadPortfolio(): any {
  
    return this.portfolioService.getPortfolio().pipe(
      tap((data: any) => {
        this.stocks = data.stocks;
        this.fetchStockDetails();
        this.fetchCurrentPrice();
      }),
      catchError((error: any) => {
        console.error('Error fetching portfolio', error);
        return of(null); 
      })
    );
  }

  loadWalletBalance(): any {
    
    return this.portfolioService.getWalletBalance().pipe(
      tap((data: { balance: number }) => {
        this.walletBalance = data.balance;
      }),
      catchError((error: any) => {
        console.error('Error fetching wallet balance', error);
        return of(null); 
      })
    );
  }

  openBuyModal(stock: any): void {
    const modalRef = this.modalService.open(BuyModalComponent);
    modalRef.componentInstance.stock = stock;
    modalRef.componentInstance.walletBalance = this.walletBalance; 

    modalRef.result.then((result) => {
      if (result && result.success == true) {
        this.loadAgain(); 
        this.boughtSuccessfully = true
        this.stockProcessed = stock.ticker
        setTimeout(() => {
          this.boughtSuccessfully = false;
          this.stockProcessed = ""
        }, 5000);
        this.changeDetectorRef.detectChanges();
      }
    }, (reason) => { });
  }

  openSellModal(stock: any): void {
    const modalRef = this.modalService.open(SellModalComponent);
    modalRef.componentInstance.stock = stock;

    modalRef.result.then((result) => {
      if (result && result.success == true) {
        this.loadAgain();
        this.soldSuccessfully = true
        this.stockProcessed = stock.ticker
        setTimeout(() => {
          this.soldSuccessfully = false;
          this.stockProcessed = ""
        }, 5000);
        this.changeDetectorRef.detectChanges();
      }
    }, (reason) => { });
  }

  calculateClass(stock: any): string {
    const currentPriceRounded = Math.round(stock.currentPrice * 100);
    const averageCostRounded = Math.round(stock.averageCost * 100);
    if (currentPriceRounded > averageCostRounded) return 'profit';
    else if (currentPriceRounded < averageCostRounded) return 'loss';
    return 'unchanged';
  }


  calculateChangeInPrice(stock: any): number {
    return Math.abs(stock.currentPrice - stock.averageCost);
  }
}
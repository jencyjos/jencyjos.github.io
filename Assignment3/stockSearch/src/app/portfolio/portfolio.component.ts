import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service';
import { BuyModalComponent } from '../buy-modal/buy-modal.component';
import { SellModalComponent } from '../sell-modal/sell-modal.component';
import { Stock } from '../../../../backend/models/stock.model'; // Path might differ based on where you place your model

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  stocks: any[] = []; // Assuming you have a model for stocks
  walletBalance: number = 25000; // Initial balance, should ideally be fetched from the backend

  constructor(
    private portfolioService: PortfolioService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPortfolio();
    this.loadWalletBalance();
    
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


  loadPortfolio(): void {
    this.portfolioService.getPortfolio().subscribe(
      (data: any) => { // Adjust based on your actual Stock model
        this.stocks =[...data.stocks];;
        this.fetchStockDetails();
        this.fetchCurrentPrice();
      },
      (error: any) => {
        console.error('Error fetching portfolio', error);
      }
    );
  }

  loadWalletBalance(): void {
    // Implement this method in your service
    this.portfolioService.getWalletBalance().subscribe(
      (data: { balance: number }) => {
        this.walletBalance = data.balance;
        this.changeDetectorRef.detectChanges();
      },
      (error: any) => {
        console.error('Error fetching wallet balance', error);
      }
    );
  }

  openBuyModal(stock: any): void {
    const modalRef = this.modalService.open(BuyModalComponent);
    modalRef.componentInstance.stock = stock;
    modalRef.componentInstance.walletBalance = this.walletBalance; // Pass the current balance to the modal

    modalRef.result.then((result) => {
      if (result && result.success == true) {
        this.loadPortfolio();
        this.loadWalletBalance();
      }
    }, (reason) => {});
  }

  openSellModal(stock: any): void {
    const modalRef = this.modalService.open(SellModalComponent);
    modalRef.componentInstance.stock = stock;

    modalRef.result.then((result) => {
      if (result && result.success == true) {
        this.loadPortfolio();
        this.loadWalletBalance(); // Reload balance and portfolio to reflect changes
      }
    }, (reason) => {});
  }

  calculateClass(stock: any): string {
    if (stock.currentPrice > stock.averageCost) return 'profit';
    else if (stock.currentPrice < stock.averageCost) return 'loss';
    return 'unchanged';
  }

  calculateChangeInPrice(stock: any): number {
    return Math.abs(stock.currentPrice - stock.averageCost);
  }
}

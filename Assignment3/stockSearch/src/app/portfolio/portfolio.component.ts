import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service';
import { BuyModalComponent } from '../buy-modal/buy-modal.component';
import { SellModalComponent } from '../sell-modal/sell-modal.component';

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
    private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadPortfolio();
    this.loadWalletBalance();
  }

  loadPortfolio(): void {
    this.portfolioService.getPortfolio().subscribe(
      (data: any[]) => { // Adjust based on your actual Stock model
        this.stocks = data;
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
      if (result === 'success') {
        this.loadPortfolio();
        this.loadWalletBalance(); // Reload balance and portfolio to reflect changes
      }
    }, (reason) => {});
  }

  openSellModal(stock: any): void {
    const modalRef = this.modalService.open(SellModalComponent);
    modalRef.componentInstance.stock = stock;

    modalRef.result.then((result) => {
      if (result === 'success') {
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
}

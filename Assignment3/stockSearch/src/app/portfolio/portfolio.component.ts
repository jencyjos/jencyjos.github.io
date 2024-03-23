import { Component, OnInit } from '@angular/core';
import { Stock } from '../../../../backend/models/stock.model'; 
import { PortfolioService } from '../services/portfolio.service'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuyModalComponent } from '../buy-modal/buy-modal.component';
import { SellModalComponent } from '../sell-modal/sell-modal.component';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  stocks: Stock[] = [];
  
  constructor(
    private portfolioService: PortfolioService,
    private modalService: NgbModal) {}

  ngOnInit(): void {
    // Load the user's portfolio from the backend
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    // This function should call a service to load the user's portfolio from the backend.
    // For example:
    // this.portfolioService.getPortfolio().subscribe(data => {
    //   this.stocks = data;
    // });
    this.portfolioService.getPortfolio().subscribe(
      (data: Stock[]) => {
        this.stocks = data;
      },
      error => {
        console.error('Error fetching portfolio', error);
      }
    );
  }

  openBuyModal(stock: any): void {
    // Open a modal for buying more shares of the given stock
    // You will need to implement this method to work with a modal service or component.
    const modalRef = this.modalService.open(BuyModalComponent);
    modalRef.componentInstance.stock = stock;
    modalRef.result.then((result) => {
      // Handle the result from the modal
      // Refresh the portfolio data if a purchase was made
    }, (reason) => {
      // Handle the close or dismiss action
    });
  }

  openSellModal(stock: any): void {
    // Open a modal for selling shares of the given stock
    // Implement this method similar to openBuyModal.
    const modalRef = this.modalService.open(SellModalComponent);
    modalRef.componentInstance.stock = stock;

    modalRef.result.then(
      (result) => {
        // Handle the result of the sell operation
        // E.g., refresh the portfolio, show a message, etc.
      },
      (reason) => {
        // Handle the dismiss of the modal
      }
    );
  }

  }

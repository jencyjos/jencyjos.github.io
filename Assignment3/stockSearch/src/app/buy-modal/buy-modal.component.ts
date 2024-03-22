import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Stock } from '../models/stock.model';

@Component({
  selector: 'buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.css']
})
export class BuyModalComponent {
  @Input() stock!: Stock;

  constructor(public activeModal: NgbActiveModal) {}

  buyStock() {
    // Logic to buy stock
    this.activeModal.close();
  }
}
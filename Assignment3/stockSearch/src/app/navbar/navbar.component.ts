import { Component } from '@angular/core';
import { StockService } from '../services/stock.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isNavbarCollapsed = true;
  service: any;

  constructor(private state: StockService, private route: ActivatedRoute, private router: Router){
    this.service = state
  }

}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms'; //To use two-way data binding with [(ngModel)] for form inputs
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; //navbar
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HighchartsChartModule } from 'highcharts-angular';

import { HomeComponent } from './home/home.component';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { NewsDetailModalComponent } from './news-detail-modal-component/news-detail-modal-component.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BuyModalComponent } from './buy-modal/buy-modal.component';
import { SellModalComponent } from './sell-modal/sell-modal.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchDetailsComponent,
    NewsDetailModalComponent,
    WatchlistComponent,
    PortfolioComponent,
    BuyModalComponent,
    SellModalComponent,
    NavbarComponent,
    FooterComponent,
    MainLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // make sure AppRoutingModule is listed in imports
    FormsModule,              
    NgbModule,
    HttpClientModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    HighchartsChartModule,
    MatProgressSpinner 
  ],
  providers: [
    provideAnimationsAsync('noop')
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


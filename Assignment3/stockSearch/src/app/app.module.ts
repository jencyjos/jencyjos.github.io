import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// Import all other components here
import { HomeComponent } from './home/home.component';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchDetailsComponent,
    WatchlistComponent,
    PortfolioComponent
    // list all your components here
  ],
  imports: [
    BrowserModule,
    AppRoutingModule // make sure AppRoutingModule is listed in imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }




// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouterModule } from '@angular/router';

// import { AppComponent } from './app.component';
// // Import other components you have created
// import { HomeComponent } from './home/home.component';
// import { SearchDetailsComponent } from './search-details/search-details.component';
// import { WatchlistComponent } from './watchlist/watchlist.component';
// import { PortfolioComponent } from './portfolio/portfolio.component';

// // Define your routes
// const routes = [
//   { path: '', redirectTo: '/search/home', pathMatch: 'full' },
//   { path: 'search/home', component: HomeComponent },
//   { path: 'search/:ticker', component: SearchDetailsComponent },
//   { path: 'watchlist', component: WatchlistComponent },
//   { path: 'portfolio', component: PortfolioComponent },
// ];

// @NgModule({
//   declarations: [
//     AppComponent,
//     HomeComponent,
//     SearchDetailsComponent,
//     WatchlistComponent,
//     PortfolioComponent,
//     // Add any other components you have here
//   ],
//   imports: [
//     BrowserModule,
//     RouterModule.forRoot(routes), // Set up the Angular routing
//   ],
//   providers: [],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }

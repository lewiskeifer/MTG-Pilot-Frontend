import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatFormFieldModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatTableModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeckDetailComponent } from './deck-detail/deck-detail.component';
import { DeckListComponent } from './deck-list/deck-list.component';
import { DeckSearchComponent } from './deck-search/deck-search.component';
import { DecksComponent } from './decks/decks.component';
import { GoogleLineChartService } from './google-charts/google-line-chart-service';
import { LineChartComponent } from './google-charts/line-chart.component';
import { MessagesComponent } from './messages/messages.component';
import { InMemoryDataService } from './service/in-memory-data.service';
 
@NgModule({
  declarations: [
    AppComponent,
    DecksComponent,
    DeckDetailComponent,
    MessagesComponent,
    DashboardComponent,
    DeckSearchComponent,
    DeckListComponent,
    LineChartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSelectModule,
    HttpClientModule,

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    )
  ],
  providers: [
    GoogleLineChartService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

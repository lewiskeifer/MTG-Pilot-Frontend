import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component';
import { DecksComponent } from './decks/decks.component';
import { DeckDetailComponent } from './deck-detail/deck-detail.component';
import { MessagesComponent } from './messages/messages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
 
@NgModule({
  declarations: [
    AppComponent,
    DecksComponent,
    DeckDetailComponent,
    MessagesComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    // no need to place any providers due to the `providedIn` flag...
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
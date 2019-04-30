import { Component, OnInit } from '@angular/core';
import { Deck } from '../deck';
import { DeckService } from '../deck.service'
import { Injectable } from '@angular/core';
import { Output, EventEmitter } from '@angular/core'; 

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-deck-list',
  templateUrl: './deck-list.component.html',
  styleUrls: ['./deck-list.component.scss']
})
export class DeckListComponent implements OnInit {

  @Output() someEvent = new EventEmitter<Deck>();

  selectedDeck: Deck;
  decks: Deck[];

  constructor(private deckService: DeckService) { }

  ngOnInit() {
    this.getDecks();
   }

   callParent(id: number) {
     console.log("chunga.bunga");
     console.log(id);
    this.deckService.getDeck(id).subscribe(deck =>{this.selectedDeck = deck; this.someEvent.emit(this.selectedDeck);});
    console.log(this.selectedDeck);

  }

  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => this.decks = decks);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.deckService.addDeck({name} as Deck).subscribe(deck => {this.decks.push(deck);});
  }

  delete(deck: Deck): void {
    this.decks = this.decks.filter(d => d !== deck);
    this.deckService.deleteDeck(deck).subscribe();
  }

}
import { Component, EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { Deck } from '../deck';
import { Card } from '../card';
import { DeckService } from '../deck.service';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-deck-list',
  templateUrl: './deck-list.component.html',
  styleUrls: ['./deck-list.component.scss']
})
export class DeckListComponent implements OnInit {

  @Output() selectDeck = new EventEmitter<Deck>();
  @Output() selectCards = new EventEmitter<Card[]>();

  selectedDeck: Deck;
  selectedCards: Card[];
  decks: Deck[];

  constructor(private deckService: DeckService) { }

  ngOnInit() {
    this.getDecks();
  }

  emitEvent(id: number) {
    this.deckService.getDeck(id)
      .subscribe(deck =>{ this.selectedDeck = deck; this.selectedCards = deck.cards; 
        this.selectDeck.emit(this.selectedDeck); this.selectCards.emit(this.selectedCards); });
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

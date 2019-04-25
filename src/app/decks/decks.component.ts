import { Component, OnInit } from '@angular/core';
import { Deck } from '../deck';
import { DeckService } from '../deck.service'

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {

  decks: Deck[];

  constructor(private deckService: DeckService) { }

  ngOnInit() {
    this.getDecks();
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

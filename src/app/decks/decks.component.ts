import { Component, OnInit, Input } from '@angular/core';
import { Deck } from '../deck';
import { DeckService } from '../deck.service';
import { DeckListComponent } from '../deck-list/deck-list.component';
import { DeckDetailComponent } from '../deck-detail/deck-detail.component';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {

  @Input() deck: Deck;

  constructor(private deckListComponent: DeckListComponent, private deckDetailComponent: DeckDetailComponent) { }

  ngOnInit() {}

  onSomeEvent(deck: Deck) {
    console.log("parent mcchungger");
    console.log(deck);
    this.deckDetailComponent.setDeck(deck);
    this.deck = deck;
  }
}

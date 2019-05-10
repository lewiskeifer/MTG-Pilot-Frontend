import { Component, OnInit } from '@angular/core';
import { Deck } from '../deck';
import { Card } from '../card';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {

  deck: Deck;
  cards: Card[];

  constructor() { }

  ngOnInit() {}

  selectDeckEvent(deck: Deck) {
    this.deck = deck;
  }

  selectCardsEvent(cards: Card[]) {
    this.cards = cards;
  }
}

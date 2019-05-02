import { Component, OnInit } from '@angular/core';
import { Deck } from '../deck';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {

  deck: Deck;

  constructor() { }

  ngOnInit() {}

  selectDeckEvent(deck: Deck) {
    this.deck = deck;
  }
}

import { Component, Injectable, Input, OnInit } from '@angular/core';
import { Deck } from '../deck';
import { DeckService } from '../deck.service';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent implements OnInit {

  @Input() 
  public deck: Deck;

  constructor(private deckService: DeckService) { }

  ngOnInit(): void {
    this.setDeck(1);
  }

  getDeck(): Deck {
    return this.deck;
  }

  setDeck(id: number): void {
    this.deckService.getDeck(id).subscribe(deck => this.deck = deck);
  }

  // goBack(): void {
  //   this.location.back();
  // }

  // save(): void {
  //   this.deckService.updateDeck(this.deck);
  //     // .subscribe(() => this.goBack());
  // }

}

import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Card } from '../model/card';
import { Deck } from '../model/deck';
import { DeckService } from '../service/deck.service';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent implements OnInit {

  dataSource: MatTableDataSource<Card>;
  displayedColumns: string[] = ['card', 'value'];

  decks: Deck[];
  deck: Deck;

  emptyCard: Card;
  selectedCard: Card;

  loading: boolean;

  constructor(private deckService: DeckService) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.setDeck(0);
    this.getDecks();
    this.emptyCard = new Card();
    this.selectedCard = this.emptyCard;
    this.loading = false;
  }

  getDeck(deckId: number): void {
    this.deckService.getDeck(deckId)
      .subscribe(deck => this.deck = deck);
  }

  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => this.decks = decks);
  }

  setDeck(id: number): void {
    this.deckService.getDeck(id)
      .subscribe(deck => { this.deck = deck; this.dataSource.data = deck.cards; this.setCard(0); });
  }

  setCard(index: number): void {
    this.selectedCard = this.deck.cards[index];
  }

  resetSelectedCard(): void {
    this.selectedCard = this.emptyCard;
  }

  // TODO refresh deck table
  saveCard(isFoil: boolean, condition: string): void {
    this.selectedCard.cardCondition = condition;
    this.selectedCard.isFoil = isFoil;
    this.deckService.saveCard(this.selectedCard, this.deck.id).
      subscribe(card => { this.getDeck(this.deck.id); this.selectedCard = card; });
  }

  // TODO refresh deck table
  deleteCard(): void {
    this.deckService.deleteCard(this.selectedCard.id).
      subscribe(deck => { this.getDeck(this.deck.id); this.resetSelectedCard(); });
  }

  saveDeck(): void {
    this.deckService.saveDeck(this.deck, this.deck.id).subscribe(deck => { this.getDecks(); });
  }

  deleteDeck(): void {
    this.deckService.deleteDeck(this.deck.id).subscribe(deck => { this.getDecks(); });
  }

  refreshDeck():void {
    this.loading = true;
    this.deckService.refreshDeck(this.deck.id)
      .subscribe(deck => { this.setDeck(this.deck.id); this.loading = false; this.getTotalCost(); });
  }

  getTotalCost() {
    var total = 0;
    if (this.deck && this.deck.cards) {
      this.deck.cards.forEach(element => {
        total += (element.marketPrice * element.quantity) | 0;
      });
    }

    return total;
  }

}

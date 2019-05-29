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

  emptyDeck: Deck;
  selectedDeck: Deck;

  emptyCard: Card;
  selectedCard: Card;

  loading: boolean;

  constructor(private deckService: DeckService) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.emptyDeck = new Deck();
    this.emptyCard = new Card();
    this.setDeck(0);
    this.getDecks();
    this.loading = false;
  }

  getDeck(deckId: number): void {
    this.deckService.getDeck(deckId)
      .subscribe(deck => { this.selectedDeck = deck; this.dataSource.data = deck.cards; });
  }

  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => this.decks = decks);
  }

  setDeck(id: number): void {
    this.deckService.getDeck(id)
      .subscribe(deck => { this.selectedDeck = deck; this.setDeckHelper(); });
  }

  setDeckHelper(): void {
    if (this.selectedDeck.cards.length != 0) {
      this.dataSource.data = this.selectedDeck.cards; 
      this.setCard(0);
    } 
    else {
      this.dataSource.data = []; 
      this.resetSelectedCard();
    }
  }

  setCard(index: number): void {
    this.selectedCard = this.selectedDeck.cards[index];
  }

  resetSelectedDeck(): void {
    this.selectedDeck = this.emptyDeck;
  }

  resetSelectedCard(): void {
    this.selectedCard = this.emptyCard;
  }

  saveCard(isFoil: boolean, condition: string): void {
    this.selectedCard.cardCondition = condition;
    this.selectedCard.isFoil = isFoil;
    this.deckService.saveCard(this.selectedCard, this.selectedDeck.id).
      subscribe(card => { this.getDeck(this.selectedDeck.id); this.selectedCard = card; });
  }

  deleteCard(): void {
    this.deckService.deleteCard(this.selectedDeck.id, this.selectedCard.id).
      subscribe(deck => { this.getDeck(this.selectedDeck.id); this.setCard(0); });
  }

  saveDeck(): void {
    this.deckService.saveDeck(this.selectedDeck).subscribe(deck => { this.getDecks(); });
  }

  deleteDeck(): void {
    this.deckService.deleteDeck(this.selectedDeck.id).subscribe(deck => { this.getDecks(); this.setDeck(0); this.setCard(0); });
  }

  refreshDeck():void {
    this.loading = true;
    this.deckService.refreshDeck(this.selectedDeck.id)
      .subscribe(deck => { this.setDeck(this.selectedDeck.id); this.loading = false; this.getTotalCost(); });
  }

  getTotalCost() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.cards) {
      this.selectedDeck.cards.forEach(element => {
        total += (element.marketPrice * element.quantity) | 0;
      });
    }

    return total;
  }

}

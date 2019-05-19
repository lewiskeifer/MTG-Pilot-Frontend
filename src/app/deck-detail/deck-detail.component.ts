import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Card } from '../card';
import { Deck } from '../deck';
import { DeckService } from '../deck.service';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent implements OnInit {

  @Input() deck: Deck;
  @Input() dataSource: MatTableDataSource<Card>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  emptyCard: Card;
  selectedCard: Card;

  loading: boolean;

  constructor(private deckService: DeckService) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.setDeck(0);
    this.emptyCard = new Card();
    this.selectedCard = this.emptyCard;
    this.loading = false;
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    if (this.dataSource == null) return;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDeck(): Deck {
    return this.deck;
  }

  setDeck(id: number): void {
    this.deckService.getDeck(id)
      .subscribe(deck => { this.deck = deck; this.dataSource.data = deck.cards; });
  }

  setCard(index: number): void {
    this.selectedCard = this.dataSource[index];
  }

  resetSelectedCard(): void {
    this.selectedCard = this.emptyCard;
  }

  saveCard(isFoil: boolean, condition: string): void {
    this.selectedCard.cardCondition = condition;
    this.selectedCard.isFoil = isFoil;
    this.deckService.saveCard(this.selectedCard, this.deck.id).subscribe();
  }

  refreshDeck():void {
    this.loading = true;
    this.deckService.refreshDeck(this.deck.id)
      .subscribe(deck => { this.setDeck(this.deck.id); this.loading = false; this.getTotalCost(); });
  }

  displayedColumns: string[] = ['card', 'value'];

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

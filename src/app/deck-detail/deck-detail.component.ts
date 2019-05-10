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

  emptyCard: Card;
  selectedCard: Card;

  foils: string[];
  conditions: string[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private deckService: DeckService) { }

  ngOnInit(): void {
    this.setDeck(333);
    this.emptyCard = new Card();
    this.selectedCard = this.emptyCard;
    this.foils = ["nonfoil", "foil"];
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
    // TODO this.datasource.data can throw null
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
    console.log(this.deck.id);
    this.selectedCard.cardCondition = condition;
    this.selectedCard.isFoil = isFoil;
    this.deckService.saveCard(this.selectedCard, this.deck.id).subscribe();
  }

  // Unused
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  displayedColumns: string[] = ['card', 'value'];

  // TODO
  getTotalCost() {
    return 5;
  }

}

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

  @Input() 
  deck: Deck;

  @Input() 
  dataSource: MatTableDataSource<Card>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private deckService: DeckService) { }

  ngOnInit(): void {
    this.setDeck(333);
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  // Temp
  displayedColumns: string[] = ['card', 'value'];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return 5;
  }

}

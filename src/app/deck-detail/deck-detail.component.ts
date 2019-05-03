import { Component, Injectable, Input, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
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
  public dataSource: MatTableDataSource<Card>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private deckService: DeckService, private changeDetectorRefs: ChangeDetectorRef) {
    // this.dataSource = new MatTableDataSource<Card>();
    // this.setDeck(1);
   }

  ngOnInit(): void {
    this.setDeck(1);
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDeck(): Deck {
    return this.deck;
  }

  setDeck(id: number): void {
    this.deckService.getDeck(id).subscribe(deck => { this.deck = deck; this.dataSource.data = deck.cards; });
    //console.log(this.deck.name);
    // this.changeDetectorRefs.detectChanges(); 
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

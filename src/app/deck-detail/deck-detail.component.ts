import { Component, Injectable, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Card } from '../card';
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

  public datasource: MatTableDataSource<Card>; 

  public card = new Card("chunga", 2);

  constructor(private deckService: DeckService, private changeDetectorRefs: ChangeDetectorRef) {
    this.datasource = new MatTableDataSource<Card>();
   }

  ngOnInit(): void {
    this.setDeck(1);
  }

  getDeck(): Deck {
    return this.deck;
  }

  setDeck(id: number): void {
    this.deckService.getDeck(id).subscribe(deck => { this.deck = deck; this.datasource.data = deck.cards; });
    this.changeDetectorRefs.detectChanges();
    this.datasource._updatePaginator;
  }

  // goBack(): void {
  //   this.location.back();
  // }

  // save(): void {
  //   this.deckService.updateDeck(this.deck);
  //     // .subscribe(() => this.goBack());
  // }

  // Temp
  displayedColumns: string[] = ['card', 'value'];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return 5;
  }

}

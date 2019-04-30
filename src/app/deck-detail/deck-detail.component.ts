import { Component, OnInit, Input, OnChanges, ApplicationRef, NgZone, ChangeDetectionStrategy  } from '@angular/core';
import { Deck } from '../deck';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DeckService }  from '../deck.service';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckDetailComponent implements OnInit {

  // @Input() 
  private deck: Deck;

  constructor(
    private deckService: DeckService,
    // private ngZone: NgZone
    // private ref: ApplicationRef,
  ) { }

  ngOnInit(): void {
    //this.setDeck(1);
  }

  // ngOnChanges(): void {
  //   console.log("change");
  //   this.getDeck();
  // }

  getDeck(): Deck {
    return this.deck;
  }

  setDeck(deck: Deck): void {
    console.log("ddc: " + deck);
    this.deck = deck;
    //this.deckService.getDeck(id).subscribe(deck => this.deck = deck);
    // this.ngZone.run(callback);
    // this.ref.tick();
    // this.ref.markForCheck();
  }

  // goBack(): void {
  //   this.location.back();
  // }

  // save(): void {
  //   this.deckService.updateDeck(this.deck);
  //     // .subscribe(() => this.goBack());
  // }

}

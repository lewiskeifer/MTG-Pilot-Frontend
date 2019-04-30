import { Component, OnInit, Input } from '@angular/core';
import { Deck } from '../deck';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DeckService }  from '../deck.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss']
})
export class DeckDetailComponent implements OnInit {

  // @Input() deck: Deck;
  deck$: Observable<Deck>;

  constructor(
    //private route: ActivatedRoute,
    private deckService: DeckService,
    //private location: Location
  ) {    this.setDeck(1); }

  ngOnInit(): void {
    this.setDeck(1);
  }

  getDeck(): Observable<Deck> {
    //const id = +this.route.snapshot.paramMap.get('id');
    // this.deckService.getDeck(1)
    //   .subscribe(deck => this.deck = deck);
    return this.deck$;
  }

  setDeck(id: number): void {
    console.log("chunger");
    this.deck$ = this.deckService.getDeck(id);
  }

  // goBack(): void {
  //   this.location.back();
  // }

  // save(): void {
  //   this.deckService.updateDeck(this.deck);
  //     // .subscribe(() => this.goBack());
  // }

}

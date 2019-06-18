import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Deck } from '../_model/deck';
import { DeckService } from '../_service/deck.service';

@Component({
  selector: 'app-deck-search',
  templateUrl: './deck-search.component.html',
  styleUrls: ['./deck-search.component.scss']
})
export class DeckSearchComponent implements OnInit {

  decks$: Observable<Deck[]>;
  private searchTerms = new Subject<string>();
 
  constructor(private deckService: DeckService) {}
 
  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
 
  ngOnInit(): void {
    this.decks$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
 
      // ignore new term if same as previous term
      distinctUntilChanged(),
 
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.deckService.searchDecks(term)),
    );
  }

}

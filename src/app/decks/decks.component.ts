import { Component } from '@angular/core';
import { Deck } from '../_model/deck';
import { Series } from '../_shared/snapshot-series';

/*
 * The singles page: the charts for every deck, then the deck and card tables beneath them.
 *
 * The series come from the detail screen's own load rather than a second request of our own,
 * so the charts redraw whenever Refresh Values, a save or a delete brings back new figures.
 */
@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss'],
  standalone: false
})
export class DecksComponent {

  series: Series[] = [];

  onDecksLoaded(decks: Deck[]): void {
    // Index 0 is the server's overview object, which carries no snapshots of its own
    this.series = decks.slice(1)
      .filter(deck => deck.deckSnapshots && deck.deckSnapshots.length > 0)
      .map(deck => ({ name: deck.name, snapshots: deck.deckSnapshots }));
  }
}

import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { User } from '../_model/user';
import { DeckService } from '../_service/deck.service';
import { SealedService } from '../_service/sealed.service';
import { aggregate, collectDates, densify, Series } from '../_shared/snapshot-series';

interface StatTile {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ],
  standalone: false
})
export class DashboardComponent implements OnInit {

  currentUser: User;
  loading = true;
  showWelcomePage = false;

  // Singles and sealed as one series each; the section's overview line totals them
  portfolioSeries: Series[] = [];

  heroValue: string;
  heroDelta: string;
  heroDeltaUp: boolean;
  tiles: StatTile[] = [];

  constructor(private deckService: DeckService, private sealedService: SealedService) {}

  ngOnInit(): void {

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

    forkJoin({
      decks: this.deckService.getDecks(this.currentUser.id),
      sealed: this.sealedService.getDecks(this.currentUser.id)
    }).subscribe(result => {

      // Index 0 of each response is the server's overview object, which carries no snapshots
      const singles: Series[] = result.decks.slice(1)
        .map(deck => ({ name: deck.name, snapshots: deck.deckSnapshots }));
      const sealed: Series[] = result.sealed.slice(1)
        .map(collection => ({ name: collection.name, snapshots: collection.sealedCollectionSnapshots }));

      const singlesDates = collectDates(singles);
      const sealedDates = collectDates(sealed);

      if (singlesDates.length === 0 && sealedDates.length === 0) {
        this.showWelcomePage = true;
        this.loading = false;
        return;
      }

      this.portfolioSeries = [
        { name: 'Singles', snapshots: aggregate(singles, singlesDates) },
        { name: 'Sealed', snapshots: aggregate(sealed, sealedDates) }
      ];

      this.buildSummary();
      this.loading = false;
    });
  }

  private buildSummary(): void {

    const dates = collectDates(this.portfolioSeries);
    const total = aggregate(this.portfolioSeries, dates);
    const columns = this.portfolioSeries.map(entry => densify(entry.snapshots, dates));

    const last = total[total.length - 1];
    // Compare against 30 days back, or the earliest point held if the history is shorter
    const priorIndex = Math.max(0, total.length - 31);
    const prior = total[priorIndex];

    this.heroValue = this.money(last.value);
    this.heroDelta = this.signedMoney(last.value - prior.value) + ' in '
      + (total.length - 1 - priorIndex) + ' days';
    this.heroDeltaUp = last.value >= prior.value;

    this.tiles = [
      {
        label: 'Singles',
        value: this.money(columns[0][columns[0].length - 1].value)
      },
      {
        label: 'Sealed',
        value: this.money(columns[1][columns[1].length - 1].value)
      },
      {
        label: 'Purchase price',
        value: this.money(last.purchasePrice)
      },
      {
        label: 'Value / purchase price',
        value: last.purchasePrice !== 0 ? (last.value / last.purchasePrice).toFixed(2) : '--'
      }
    ];
  }

  private money(value: number): string {
    return Math.round(value).toLocaleString('en-US',
      { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  private signedMoney(value: number): string {
    return (value >= 0 ? '+' : '-') + this.money(Math.abs(value));
  }
}

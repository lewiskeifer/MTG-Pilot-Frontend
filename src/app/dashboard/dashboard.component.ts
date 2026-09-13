import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Deck } from '../_model/deck';
import { SealedCollection } from '../_model/sealedCollection';
import { User } from '../_model/user';
import { DeckService } from '../_service/deck.service';
import { SealedService } from '../_service/sealed.service';
import { Holding } from '../_shared/holding';
import { aggregate, collectDates, densify, rangeLabelOf, rangeStartIndex, Series, toLocalDate }
  from '../_shared/snapshot-series';

interface StatTile {
  label: string;
  value: string;
}

/** Everything the chart section needs for one of the three things this page can plot. */
interface ChartView {
  key: string;
  label: string;
  series: Series[];
  moverSeries: Series[];
  overviewName: string;
  valueTitle: string;
  ratioTitle: string;
  tableCaption: string;
  pickerLabel: string;
  idPrefix: string;
  showAll: boolean;
  /*
   * The individual cards or products behind the series, pooled across their decks and
   * collections. Left empty on the portfolio view: its two lines are the halves of the
   * collection, and a list of single cards is not what that view is asking about.
   */
  holdings: Holding[];
  holdingsTitle: string;
  holdingsLabel: string;
  /** The day each range's baseline prices were read, so a short history can name its own span. */
  baselineDates: { [days: string]: string };
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

  /*
   * This page owns every graph in the app. The singles and sealed screens are for editing decks
   * and collections; their charts live here behind the view toggle so one place answers "how is
   * this doing" for the whole collection and for either half of it.
   */
  views: ChartView[] = [];
  activeKey = 'portfolio';

  heroValue: string;
  heroDelta: string;
  heroDeltaUp: boolean;
  tiles: StatTile[] = [];

  /*
   * Held here rather than inside the chart section, because the headline delta below quotes the
   * same window as the charts. The section reports its range presets back through rangeDaysChange.
   */
  rangeDays = 0;

  private portfolioSeries: Series[] = [];

  constructor(private deckService: DeckService, private sealedService: SealedService) {}

  get activeView(): ChartView {
    return this.views.find(view => view.key === this.activeKey) || this.views[0];
  }

  ngOnInit(): void {

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

    forkJoin({
      decks: this.deckService.getDecks(this.currentUser.id),
      sealed: this.sealedService.getDecks(this.currentUser.id)
    }).subscribe(result => {

      // Index 0 of each response is the server's overview object, which carries no snapshots
      const singles: Series[] = result.decks.slice(1)
        .filter(deck => deck.deckSnapshots && deck.deckSnapshots.length > 0)
        .map(deck => ({ name: deck.name, snapshots: deck.deckSnapshots, group: 'Singles' }));
      const sealed: Series[] = result.sealed.slice(1)
        .filter(collection => collection.sealedCollectionSnapshots && collection.sealedCollectionSnapshots.length > 0)
        .map(collection => ({
          name: collection.name,
          snapshots: collection.sealedCollectionSnapshots,
          group: 'Sealed'
        }));

      if (singles.length === 0 && sealed.length === 0) {
        this.showWelcomePage = true;
        this.loading = false;
        return;
      }

      this.portfolioSeries = [
        { name: 'Singles', snapshots: aggregate(singles, collectDates(singles)) },
        { name: 'Sealed', snapshots: aggregate(sealed, collectDates(sealed)) }
      ];

      const cards = this.cardHoldings(result.decks.slice(1));
      const products = this.sealedHoldings(result.sealed.slice(1));

      // Carried on every deck and collection alike, so the overview object at index 0 has it too
      const cardDates = result.decks[0].baselineDates || {};
      const productDates = result.sealed[0].baselineDates || {};

      this.views = [
        {
          key: 'portfolio',
          label: 'Portfolio',
          series: this.portfolioSeries,
          moverSeries: [...singles, ...sealed],
          overviewName: 'Portfolio Total',
          valueTitle: 'Portfolio Total Value',
          ratioTitle: 'Portfolio Value / Purchase Price',
          tableCaption: 'Portfolio values by date',
          pickerLabel: 'Series',
          idPrefix: 'portfolio',
          // Two halves against their total is the whole point of this view
          showAll: true,
          holdings: [],
          holdingsTitle: '',
          holdingsLabel: '',
          baselineDates: {}
        },
        {
          key: 'singles',
          label: 'Singles',
          series: singles,
          moverSeries: singles,
          overviewName: 'Deck Overview',
          valueTitle: 'Singles Total Value',
          ratioTitle: 'Singles Value / Purchase Price',
          tableCaption: 'Singles values by date',
          pickerLabel: 'Decks',
          idPrefix: 'singles',
          // Two dozen decks and eight colour slots: open on the overview line alone
          showAll: false,
          holdings: cards,
          holdingsTitle: 'Gain / loss by card',
          holdingsLabel: 'Cards',
          baselineDates: cardDates
        },
        {
          key: 'sealed',
          label: 'Sealed',
          series: sealed,
          moverSeries: sealed,
          overviewName: 'Collection Overview',
          valueTitle: 'Sealed Total Value',
          ratioTitle: 'Sealed Value / Purchase Price',
          tableCaption: 'Sealed values by date',
          pickerLabel: 'Sealed collections',
          idPrefix: 'sealed',
          showAll: false,
          holdings: products,
          holdingsTitle: 'Gain / loss by product',
          holdingsLabel: 'Sealed products',
          baselineDates: productDates
        }
      ];

      this.buildSummary();
      this.loading = false;
    });
  }

  setView(key: string): void {
    this.activeKey = key;
  }

  /*
   * Every card in every deck as one list. `purchasePrice` on a card is what was paid for all the
   * copies of it held, while `marketPrice` is the price of one, so only the latter is multiplied
   * out - the API's own deck totals are built the same way.
   */
  private cardHoldings(decks: Deck[]): Holding[] {

    const holdings: Holding[] = [];

    decks.forEach(deck => (deck.cards || []).forEach(card => holdings.push({
      name: card.name,
      location: deck.name,
      quantity: card.quantity,
      purchasePrice: card.purchasePrice,
      value: card.marketPrice * card.quantity,
      baselinePrices: card.baselinePrices
    })));

    return holdings;
  }

  /** The same, for the sealed products inside every collection. */
  private sealedHoldings(collections: SealedCollection[]): Holding[] {

    const holdings: Holding[] = [];

    collections.forEach(collection => (collection.sealed || []).forEach(product => holdings.push({
      name: product.name,
      location: collection.name,
      quantity: product.quantity,
      purchasePrice: product.purchasePrice,
      value: product.marketPrice * product.quantity,
      baselinePrices: product.baselinePrices
    })));

    return holdings;
  }

  onRangeChange(days: number): void {
    this.rangeDays = days;
    this.buildSummary();
  }

  /*
   * The headline always describes the whole collection, whichever view the chart below is on -
   * it is the page's one hero figure, not a caption for the graph.
   */
  private buildSummary(): void {

    const dates = collectDates(this.portfolioSeries);
    const total = aggregate(this.portfolioSeries, dates);
    const columns = this.portfolioSeries.map(entry => densify(entry.snapshots, dates));

    const last = total[total.length - 1];

    // The same window the charts, table and movers use, so every figure on the page agrees
    const startIndex = rangeStartIndex(dates, this.rangeDays);
    const prior = total[startIndex];

    this.heroValue = this.money(last.value);
    this.heroDelta = this.signedMoney(last.value - prior.value) + ' ' + this.spanLabel(dates, startIndex);
    this.heroDeltaUp = last.value >= prior.value;

    this.tiles = [
      { label: 'Singles', value: this.money(columns[0][columns[0].length - 1].value) },
      { label: 'Sealed', value: this.money(columns[1][columns[1].length - 1].value) },
      { label: 'Purchase price', value: this.money(last.purchasePrice) },
      {
        label: 'Value / purchase price',
        value: last.purchasePrice !== 0 ? (last.value / last.purchasePrice).toFixed(2) : '--'
      }
    ];
  }

  /*
   * Reports the span actually covered rather than the preset's name. Ask for a year of a
   * collection eight months old and "in 243 days" is the truth; "last 365 days" is not.
   */
  private spanLabel(dates: string[], startIndex: number): string {

    if (startIndex === 0) {
      return rangeLabelOf(0);
    }

    const start = toLocalDate(dates[startIndex]);
    const end = toLocalDate(dates[dates.length - 1]);
    const days = Math.round((end.getTime() - start.getTime()) / 86400000);

    return 'in ' + days + ' days';
  }

  private money(value: number): string {
    return Math.round(value).toLocaleString('en-US',
      { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  private signedMoney(value: number): string {
    return (value >= 0 ? '+' : '-') + this.money(Math.abs(value));
  }
}

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HostListener } from '@angular/core';
import { LineChartConfig } from '../google-charts/line-chart-config';
import { MAX_SERIES, SeriesSlots } from '../google-charts/chart-palette';
import { Holding } from '../_shared/holding';
import { aggregate, collectDates, densify, rangeLabelOf, rangeStartIndex, Series, toLocalDate }
  from '../_shared/snapshot-series';

interface RangePreset {
  label: string;
  days: number;
}

/** Rank a list by what it is worth, or by how far it has come. */
type SortMode = 'value' | 'percent';

interface TableRow {
  date: Date;
  values: number[];
}

interface Mover {
  name: string;
  change: number;
  /** Null where there was nothing to measure against: no holding at the start, or nothing paid. */
  percent: number;
  /** Reads in place of a percentage where there is none. */
  percentNote?: string;
  /** Which deck or collection an item came from, on lists that pool items across all of them. */
  location?: string;
  /** Shown to the cent. Set on individual items, whose moves are often smaller than a dollar. */
  exact?: boolean;
}

interface MoverGroup {
  name: string;
  movers: Mover[];
}

/*
 * The value chart, the ratio chart, their shared filter row and the values table for one set of
 * series. Singles, sealed and the portfolio summary are all the same shape, so they all use this
 * rather than each keeping its own near-identical copy.
 */
@Component({
  selector: 'chart-section',
  templateUrl: './chart-section.component.html',
  styleUrls: ['./chart-section.component.scss'],
  standalone: false
})
export class ChartSectionComponent implements OnChanges {

  @Input() series: Series[] = [];
  @Input() overviewName: string;
  @Input() valueTitle: string;
  @Input() ratioTitle: string;
  @Input() tableCaption: string;
  @Input() pickerLabel: string;
  @Input() idPrefix: string;

  /*
   * Open with every series plotted rather than the overview alone. Only sensible where the
   * series are few and comparable - the portfolio's total against its two halves. A page with
   * two dozen decks opens on the overview, since past eight there are no colours left.
   */
  @Input() showAllByDefault = false;

  /*
   * The table of exact figures per date. Off by default: on a page that already carries its own
   * deck or collection tables below the charts, a third table is noise.
   */
  @Input() showValuesTable = false;

  /*
   * Ranked for the biggest movers beside the table, over the same date range as the charts.
   * These are the individual decks and collections rather than the plotted series: on the
   * portfolio page the chart holds two lines, and "the top two of two" tells you nothing.
   */
  @Input() moverSeries: Series[] = [];

  /*
   * Every individual card or sealed product, pooled across the decks and collections they sit
   * in. Empty on the portfolio view, where a list of single cards under a chart of two lines
   * would be answering a question nobody asked of that view.
   */
  @Input() holdings: Holding[] = [];
  @Input() holdingsTitle = '';
  /** Names what the rows are - "Cards", "Sealed products" - above the list. */
  @Input() holdingsLabel = '';

  /*
   * The day each range's baseline prices were actually read. The price history starts the night
   * the server began keeping it, so a range can reach back further than it goes, and the list
   * then names the span it really covers instead of the one on the button.
   */
  @Input() baselineDates: { [days: string]: string } = {};

  readonly rangePresets: RangePreset[] = [
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 0 }
  ];
  /*
   * Owned by the page, not by this component: the headline figures above the charts quote the
   * same window, and a range the reader can see on the buttons but not in the numbers is worse
   * than no range control at all.
   */
  @Input() rangeDays = 0;
  @Output() rangeDaysChange = new EventEmitter<number>();

  readonly maxSeries = MAX_SERIES;
  selection: string[] = [];

  totalValueData: any[];
  totalValueConfig: LineChartConfig;
  ratioData: any[];
  ratioConfig: LineChartConfig;

  tableColumns: string[] = [];
  tableRows: TableRow[] = [];
  /*
   * Newest first by default: the latest figures are the ones the reader came for, and the table
   * opens scrolled to the top. Oldest first is for reading the run forward from the beginning.
   */
  dateSort: 'desc' | 'asc' = 'desc';

  moverGroups: MoverGroup[] = [];
  moverSort: SortMode = 'value';

  /*
   * A collection runs to thousands of cards and the list is for finding the ones that moved, so
   * it is capped. Everything below the cap sat closest to where it started.
   */
  readonly holdingLimit = 100;
  holdingRows: Mover[] = [];
  holdingSort: SortMode = 'value';
  /** How many items could be measured over the window at all, before the cap. */
  holdingTotal = 0;

  /*
   * Which deck or collection the item list is narrowed to, or null for all of them. Driven by
   * the movers list beside it: that list already names every deck and ranks them, so clicking
   * one there beats a second control listing the same names again.
   */
  holdingFilter: string = null;

  private slots = new SeriesSlots();
  private screenWidth = window.innerWidth;
  private defaultsApplied = false;

  ngOnChanges(changes: SimpleChanges): void {

    /*
     * The page can swap this section between datasets - portfolio, singles, sealed - and the
     * picker's selection and colour slots belong to whichever one is showing. Carrying them
     * across would leave the chart holding names the new dataset has never heard of.
     */
    if (changes['overviewName'] && !changes['overviewName'].firstChange) {
      this.slots = new SeriesSlots();
      this.selection = [];
      this.defaultsApplied = false;
      this.moverSort = 'value';
      this.dateSort = 'desc';
      this.holdingSort = 'value';
      // The new dataset has never heard of the deck the old one was narrowed to
      this.holdingFilter = null;
    }

    this.applyDefaultSelection();
    this.build();
    // Kept out of build() so a window resize does not re-rank a few thousand items for nothing
    this.buildHoldings();
  }

  /*
   * Waits for the series to actually arrive: they load asynchronously, so the first change here
   * usually carries an empty list and picking defaults from it would strand the section on the
   * overview line. Claims cap themselves at the palette's eight slots.
   */
  private applyDefaultSelection(): void {

    if (this.defaultsApplied || !this.overviewName || !this.series || this.series.length === 0) {
      return;
    }

    const candidates = this.showAllByDefault ? this.options() : [this.overviewName];
    this.selection = candidates.filter(name => this.slots.claim(name));
    this.defaultsApplied = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.screenWidth = event.target.innerWidth;
    this.build();
  }

  get valueElementId(): string { return this.idPrefix + '_value'; }
  get ratioElementId(): string { return this.idPrefix + '_ratio'; }

  options(): string[] {
    return [this.overviewName, ...this.series.map(entry => entry.name)];
  }

  isDisabled(name: string): boolean {
    return this.slots.isFull() && !this.slots.has(name);
  }

  setRange(days: number): void {
    this.rangeDays = days;
    this.rangeDaysChange.emit(days);
    this.build();
    // The item list is measured over the same window as everything else on the page
    this.buildHoldings();
  }

  /*
   * A series holds its colour slot for as long as it stays selected, so dropping one line never
   * repaints the rest. Anything past the palette's eight slots is refused rather than cycled
   * onto a colour already in use.
   */
  onSelectionChange(selected: string[]): void {

    this.selection.filter(name => selected.indexOf(name) === -1).forEach(name => this.slots.release(name));

    const accepted = selected.filter(name => this.slots.claim(name));
    this.selection = this.options().filter(name => accepted.indexOf(name) !== -1);

    this.build();
  }

  private build(): void {

    if (!this.series || this.series.length === 0) {
      return;
    }

    const dates = collectDates(this.series);
    if (dates.length === 0) {
      return;
    }

    // The overview always totals every series, not just the selected ones, so narrowing the
    // picker never changes what the total means.
    const withOverview: Series[] = [
      { name: this.overviewName, snapshots: aggregate(this.series, dates) },
      ...this.series
    ];

    const dense = new Map<string, any[]>();
    withOverview.forEach(entry => dense.set(entry.name, densify(entry.snapshots, dates)));

    const columns = this.selection.filter(name => dense.has(name));
    const offset = rangeStartIndex(dates, this.rangeDays);
    const visible = dates.slice(offset);

    const rows = [];
    const ratios = [];

    visible.forEach((date, index) => {
      const point = toLocalDate(date);
      const at = offset + index;
      const snapshots = columns.map(name => dense.get(name)[at]);

      rows.push([point, ...snapshots.map(snapshot => snapshot ? snapshot.value : 0)]);
      // Check for division by 0
      ratios.push([point, ...snapshots.map(snapshot =>
        snapshot && snapshot.purchasePrice !== 0 ? snapshot.value / snapshot.purchasePrice : 0)]);
    });

    const colors = columns.map(name => this.slots.colorOf(name));
    const width = this.screenWidth < 1000 ? this.screenWidth - 56 : 900;

    this.totalValueConfig = new LineChartConfig(this.valueTitle, '', 950, width, '$#,##0', colors);
    this.ratioConfig = new LineChartConfig(this.ratioTitle, '', 950, width, '#,##0.00', colors);
    this.totalValueData = [columns, rows];
    this.ratioData = [columns, ratios];

    this.tableColumns = columns;
    // `rows` runs oldest to newest, which is the order the charts plot; the table follows the
    // toggle rather than that
    this.tableRows = this.showValuesTable
      ? this.inDateOrder(rows.map(row => ({ date: row[0], values: row.slice(1) })))
      : [];

    this.buildMovers();
  }

  /** Names the window the movers are measured over, so a figure is never undated. */
  get rangeLabel(): string {
    return rangeLabelOf(this.rangeDays);
  }

  /*
   * The same, for the item list, which can only measure from a day it has prices for. Where the
   * history is younger than the range, it says which day it started from rather than claiming a
   * window it never had.
   */
  get holdingWindowLabel(): string {

    const recorded = this.baselineDates ? this.baselineDates[String(this.rangeDays)] : null;

    if (this.rangeDays === 0 || !recorded) {
      return this.rangeLabel;
    }

    const asked = new Date();
    asked.setDate(asked.getDate() - this.rangeDays);

    const from = toLocalDate(recorded);
    if (from <= asked) {
      return this.rangeLabel;
    }

    return 'since ' + from.toLocaleDateString('en-US',
      { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /*
   * Only the table's direction changes, so the rows are flipped where they sit rather than
   * rebuilding the charts and the movers alongside them.
   */
  setDateSort(mode: 'desc' | 'asc'): void {

    if (this.dateSort === mode) {
      return;
    }

    this.dateSort = mode;
    this.tableRows = this.tableRows.slice().reverse();
  }

  /** Chronological rows in whichever direction the toggle is set to. */
  private inDateOrder(rows: TableRow[]): TableRow[] {
    return this.dateSort === 'desc' ? rows.reverse() : rows;
  }

  setMoverSort(mode: SortMode): void {
    this.moverSort = mode;
    this.buildMovers();
  }

  setHoldingSort(mode: SortMode): void {
    this.holdingSort = mode;
    this.buildHoldings();
  }

  /** Only worth clicking a mover where there is an item list for it to narrow. */
  get canFilterHoldings(): boolean {
    return this.holdings && this.holdings.length > 0;
  }

  filterHoldingsBy(name: string): void {
    // Clicking the row already showing goes back to everything, so the list is never stuck
    this.holdingFilter = this.holdingFilter === name ? null : name;
    this.buildHoldings();
  }

  clearHoldingFilter(): void {
    this.holdingFilter = null;
    this.buildHoldings();
  }

  /*
   * Whichever figure the list is ranked on leads the row. The mode is passed in rather than read
   * off the component: the two lists are ranked independently and share this row.
   */
  primaryText(mover: Mover, mode: SortMode): string {
    return mode === 'percent' ? this.percentText(mover) : this.moneyText(mover.change, mover.exact);
  }

  secondaryText(mover: Mover, mode: SortMode): string {
    return mode === 'percent' ? this.moneyText(mover.change, mover.exact) : this.percentText(mover);
  }

  /*
   * The arrow already carries the direction, so the figures themselves stay unsigned.
   *
   * A deck or a collection is a total in the thousands, where cents are noise. A single card is
   * priced to the cent and often moves by less than a dollar: rounded, those rows all read $0
   * and look like nothing happened, while still being ranked on the figure behind the zero.
   */
  private moneyText(value: number, exact?: boolean): string {

    const digits = exact ? 2 : 0;

    return Math.abs(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  private percentText(mover: Mover): string {

    if (mover.percent === null) {
      return mover.percentNote || 'new';
    }

    // A decimal place for the same reason the money has two: on an exact row, 0% and 0.4% are
    // different answers, and the one-digit version of both is 0%
    return Math.abs(mover.percent).toFixed(mover.exact ? 1 : 0) + '%';
  }

  /*
   * Dollar change is the default: on a portfolio view what matters is what moved the total, and
   * a $6 box doubling would otherwise outrank a $3,000 gain. Percent answers the other question
   * - which holdings are performing - so it is a toggle rather than a choice made for the reader.
   */
  private buildMovers(): void {

    this.moverGroups = [];

    if (!this.moverSeries || this.moverSeries.length === 0) {
      return;
    }

    const dates = collectDates(this.moverSeries);
    if (dates.length === 0) {
      return;
    }

    const offset = rangeStartIndex(dates, this.rangeDays);
    const end = dates.length - 1;

    // Map keeps insertion order, so the columns follow the order the series were handed over
    const byGroup = new Map<string, Mover[]>();

    this.moverSeries.forEach(entry => {

      const column = densify(entry.snapshots, dates);
      const endSnapshot = column[end];
      if (!endSnapshot) {
        return;
      }

      // Nothing held at the window's start means the series began inside it, worth 0 back then
      const startSnapshot = column[offset];
      const start = startSnapshot ? startSnapshot.value : 0;
      const change = endSnapshot.value - start;

      const group = entry.group || 'Other';
      if (!byGroup.has(group)) {
        byGroup.set(group, []);
      }

      byGroup.get(group).push({
        name: entry.name,
        change: change,
        percent: start !== 0 ? (change / start) * 100 : null
      });
    });

    byGroup.forEach((movers, name) => {
      movers.sort((a, b) => this.rankOf(b, this.moverSort) - this.rankOf(a, this.moverSort));
      this.moverGroups.push({ name: name, movers: movers });
    });
  }

  /*
   * Individual items over the selected window, pooled across every deck and collection.
   *
   * Ranked by the size of the move in either direction before the cap, then shown biggest gain
   * down to biggest loss. A straight top hundred by gain would bury every loser, and the losses
   * are half of what the list is for.
   */
  private buildHoldings(): void {

    this.holdingRows = [];
    this.holdingTotal = 0;

    if (!this.holdings || this.holdings.length === 0) {
      return;
    }

    const rows: Mover[] = [];

    this.holdings.forEach(holding => {

      // Narrowed to one deck or collection, where a mover beside this has been clicked
      if (this.holdingFilter !== null && holding.location !== this.holdingFilter) {
        return;
      }

      const base = this.baseOf(holding);

      // Nothing priced this one at the window's start, so it has no move to rank over it
      if (base === null) {
        return;
      }

      const change = holding.value - base;

      rows.push({
        name: holding.name,
        location: holding.location,
        change: change,
        // Worth nothing at the start - bought since, or no purchase price recorded - has no ratio
        percent: base !== 0 ? (change / base) * 100 : null,
        percentNote: '--',
        // Individual items are priced to the cent, unlike the deck totals in the list beside this
        exact: true
      });
    });

    this.holdingTotal = rows.length;

    rows.sort((a, b) =>
      Math.abs(this.rankOf(b, this.holdingSort)) - Math.abs(this.rankOf(a, this.holdingSort)));

    this.holdingRows = rows.slice(0, this.holdingLimit)
      .sort((a, b) => this.rankOf(b, this.holdingSort) - this.rankOf(a, this.holdingSort));
  }

  /*
   * What an item was worth at the start of the window, or null where nothing says.
   *
   * All time measures against what was paid for it: that is an item's real starting point, and
   * it is the one baseline that reaches back further than the price history does. Every shorter
   * window measures against the price recorded that many days ago, which is a move in the market
   * rather than a profit - a card bought last week still shows what its printing did all month.
   */
  private baseOf(holding: Holding): number {

    if (this.rangeDays === 0) {
      return holding.purchasePrice;
    }

    const unit = holding.baselinePrices ? holding.baselinePrices[String(this.rangeDays)] : null;

    return unit === null || unit === undefined ? null : unit * holding.quantity;
  }

  /*
   * One list per group, biggest gain at the top down to biggest loss at the bottom.
   *
   * A series worth nothing at the window's start has no meaningful percentage. Ranking it as
   * an infinite gain would park it permanently at the top, so it takes a rank of zero: below
   * every measurable gain, above every loss. Its row reads "new" rather than a number, so the
   * reason it sits there is visible.
   */
  private rankOf(mover: Mover, mode: SortMode): number {

    if (mode === 'value') {
      return mover.change;
    }

    return mover.percent === null ? 0 : mover.percent;
  }

}

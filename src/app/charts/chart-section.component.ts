import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HostListener } from '@angular/core';
import { LineChartConfig } from '../google-charts/line-chart-config';
import { MAX_SERIES, SeriesSlots } from '../google-charts/chart-palette';
import { aggregate, collectDates, densify, rangeLabelOf, rangeStartIndex, Series, toLocalDate }
  from '../_shared/snapshot-series';

interface RangePreset {
  label: string;
  days: number;
}

interface TableRow {
  date: Date;
  values: number[];
}

interface Mover {
  name: string;
  change: number;
  /** Null where the series was worth nothing at the start of the window. */
  percent: number;
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

  moverGroups: MoverGroup[] = [];
  moverSort: 'value' | 'percent' = 'value';

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
    }

    this.applyDefaultSelection();
    this.build();
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
    this.tableRows = this.showValuesTable
      ? rows.map(row => ({ date: row[0], values: row.slice(1) })).reverse()
      : [];

    this.buildMovers();
  }

  /** Names the window the movers are measured over, so a figure is never undated. */
  get rangeLabel(): string {
    return rangeLabelOf(this.rangeDays);
  }

  setMoverSort(mode: 'value' | 'percent'): void {
    this.moverSort = mode;
    this.buildMovers();
  }

  /** Whichever figure the list is currently ranked on leads the row. */
  primaryText(mover: Mover): string {
    return this.moverSort === 'percent' ? this.percentText(mover) : this.moneyText(mover.change);
  }

  secondaryText(mover: Mover): string {
    return this.moverSort === 'percent' ? this.moneyText(mover.change) : this.percentText(mover);
  }

  // The arrow already carries the direction, so the figures themselves stay unsigned
  private moneyText(value: number): string {
    return Math.round(Math.abs(value)).toLocaleString('en-US',
      { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  private percentText(mover: Mover): string {
    return mover.percent === null ? 'new' : Math.abs(mover.percent).toFixed(0) + '%';
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
      movers.sort((a, b) => this.rankOf(b) - this.rankOf(a));
      this.moverGroups.push({ name: name, movers: movers });
    });
  }

  /*
   * One list per group, biggest gain at the top down to biggest loss at the bottom.
   *
   * A series worth nothing at the window's start has no meaningful percentage. Ranking it as
   * an infinite gain would park it permanently at the top, so it takes a rank of zero: below
   * every measurable gain, above every loss. Its row reads "new" rather than a number, so the
   * reason it sits there is visible.
   */
  private rankOf(mover: Mover): number {

    if (this.moverSort === 'value') {
      return mover.change;
    }

    return mover.percent === null ? 0 : mover.percent;
  }

}

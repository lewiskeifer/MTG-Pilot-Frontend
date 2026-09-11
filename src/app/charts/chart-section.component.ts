import { Component, Input, OnChanges } from '@angular/core';
import { HostListener } from '@angular/core';
import { LineChartConfig } from '../google-charts/line-chart-config';
import { MAX_SERIES, SeriesSlots } from '../google-charts/chart-palette';
import { aggregate, collectDates, densify, Series, toLocalDate } from '../_shared/snapshot-series';

interface RangePreset {
  label: string;
  days: number;
}

interface TableRow {
  date: Date;
  values: number[];
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

  readonly rangePresets: RangePreset[] = [
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 0 }
  ];
  rangeDays = 0;

  readonly maxSeries = MAX_SERIES;
  selection: string[] = [];

  totalValueData: any[];
  totalValueConfig: LineChartConfig;
  ratioData: any[];
  ratioConfig: LineChartConfig;

  tableColumns: string[] = [];
  tableRows: TableRow[] = [];

  private slots = new SeriesSlots();
  private screenWidth = window.innerWidth;
  private defaultsApplied = false;

  ngOnChanges(): void {
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
    const visible = this.applyRange(dates);
    const offset = dates.length - visible.length;

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
  }

  private applyRange(dates: string[]): string[] {

    if (this.rangeDays === 0) {
      return dates;
    }

    const cutoff = toLocalDate(dates[dates.length - 1]);
    cutoff.setDate(cutoff.getDate() - this.rangeDays);

    return dates.filter(date => toLocalDate(date) >= cutoff);
  }
}

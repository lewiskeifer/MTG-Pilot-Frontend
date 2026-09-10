import { Component, OnInit } from '@angular/core';
import { LineChartConfig } from '../google-charts/line-chart-config';
import { Deck } from '../_model/deck';
import { User } from '../_model/user';
import { DeckService } from '../_service/deck.service';
import { HostListener } from '@angular/core';
import { SealedCollection } from '../_model/sealedCollection';
import { SealedService } from '../_service/sealed.service';
import { DeckSnapshot } from '../_model/deckSnapshot';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ],
  standalone: false
})
export class DashboardComponent implements OnInit {
  currentUser: User;
  showWelcomePage: boolean;
  screenwidth: any;

  loading: boolean;
  loading2: boolean;

  decks: Deck[];
  sealedCollection: SealedCollection[];

  singlesTotalValueData: any[];
  singlesTotalValueConfig: LineChartConfig;
  singlesTotalValueElementId: string;

  singlesRatioData: any[];
  singlesRatioConfig: LineChartConfig;
  singlesRatioElementId: string;

  sealedTotalValueData: any[];
  sealedTotalValueConfig: LineChartConfig;
  sealedTotalValueElementId: string;

  sealedRatioData: any[];
  sealedRatioConfig: LineChartConfig;
  sealedRatioElementId: string;

  constructor(private deckService: DeckService, private sealedService: SealedService) { }
 
  ngOnInit() {
    this.loading = true;
    this.loading2 = true;
    this.screenwidth = window.innerWidth;
    this.singlesTotalValueElementId = 'linechart_material';
    this.singlesRatioElementId = 'linechart_material2';
    this.sealedTotalValueElementId = 'linechart_material3';
    this.sealedRatioElementId = 'linechart_material4';

    if (this.screenwidth < 1000) {
      const mobileWidth = this.screenwidth - 56;
      this.singlesTotalValueConfig = new LineChartConfig('Singles Total Value', '', 950, mobileWidth, '$#,##0');
      this.singlesRatioConfig = new LineChartConfig('Singles Value / Purchase Price', '', 800, mobileWidth);
      this.sealedTotalValueConfig = new LineChartConfig('Sealed Total Value', '', 950, mobileWidth, '$#,##0');
      this.sealedRatioConfig = new LineChartConfig('Sealed Value / Purchase Price', '', 800, mobileWidth);
    }
    else {
      this.singlesTotalValueConfig = new LineChartConfig('Singles Total Value', '', 950, 900, '$#,##0');
      this.singlesRatioConfig = new LineChartConfig('Singles Value / Purchase Price', '', 950, 900);
      this.sealedTotalValueConfig = new LineChartConfig('Sealed Total Value', '', 950, 900, '$#,##0');
      this.sealedRatioConfig = new LineChartConfig('Sealed Value / Purchase Price', '', 950, 900);
    }

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.getDecks();
    this.getSealedCollections();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenwidth = event.target.innerWidth;
    if (this.screenwidth < 1000) {
      const mobileWidth = this.screenwidth - 56;
      this.singlesTotalValueConfig = new LineChartConfig('Singles Total Value', '', 500, mobileWidth, '$#,##0');
      this.singlesRatioConfig = new LineChartConfig('Singles Value / Purchase Price', '', 500, mobileWidth);
      this.sealedTotalValueConfig = new LineChartConfig('Sealed Total Value', '', 500, mobileWidth, '$#,##0');
      this.sealedRatioConfig = new LineChartConfig('Sealed Value / Purchase Price', '', 500, mobileWidth);
      this.setChart();
      this.setChart2();
    }
  }
 
  getDecks(): void {
    this.deckService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.decks = decks;
        if (this.decks.length > 1 && this.decks[1].deckSnapshots.length > 0) {
          this.showWelcomePage = false;
          this.setChart(); 
        }
        else { 
          this.showWelcomePage = true; 
        } 
        this.loading = false;
      });
  }

  getSealedCollections(): void {
    this.sealedService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.sealedCollection = decks;
        if (this.sealedCollection.length > 1 && this.sealedCollection[1].sealedCollectionSnapshots.length > 0) {
          this.showWelcomePage = false;
          this.setChart2(); 
        }
        else { 
          this.showWelcomePage = true; 
        } 
        this.loading2 = false;
      });
  }

  // Format data sent to google chart service
  setChart(): void {

    const charts = this.buildChartData("Deck Overview",
      this.decks.slice(1).map(deck => deck.name),
      this.decks.slice(1).map(deck => deck.deckSnapshots));

    this.singlesTotalValueData = charts.totals;
    this.singlesRatioData = charts.ratios;
  }

  // Format data sent to google chart service
  setChart2(): void {

    const charts = this.buildChartData("Collection Overview",
      this.sealedCollection.slice(1).map(collection => collection.name),
      this.sealedCollection.slice(1).map(collection => collection.sealedCollectionSnapshots));

    this.sealedTotalValueData = charts.totals;
    this.sealedRatioData = charts.ratios;
  }

  /*
   * Series are lined up by date rather than by array position. Right-aligning the snapshot
   * arrays meant that a single deck holding one extra snapshot pushed a hard zero onto every
   * other deck's earliest point, which drew as a cliff at the left edge of the chart.
   */
  private buildChartData(overviewName: string, names: string[], series: Array<DeckSnapshot[]>): { totals: any[], ratios: any[] } {

    const snapshotsByDate = series.map(snapshots => {
      const byDate = new Map<string, DeckSnapshot>();
      snapshots.forEach(snapshot => byDate.set(snapshot.timestamp.substr(0, 10), snapshot));
      return byDate;
    });

    const dates = new Set<string>();
    snapshotsByDate.forEach(byDate => byDate.forEach((snapshot, date) => dates.add(date)));

    const rows = [];
    const rows2 = [];

    // A series with no snapshot on a date carries its last known figures forward, and counts
    // as zero on the dates before it has any snapshot at all.
    const carried: DeckSnapshot[] = snapshotsByDate.map(() => null);

    Array.from(dates).sort().forEach(date => {

      var overviewValue = 0;
      var overviewPurchasePrice = 0;

      // Index 1 is the overview, filled in once the rest of the row is known
      const row: any[] = [date, 0];
      const row2: any[] = [date, 0];

      snapshotsByDate.forEach((byDate, index) => {

        const snapshot = byDate.get(date) || carried[index];
        carried[index] = snapshot;

        const value = snapshot ? snapshot.value : 0;
        const purchasePrice = snapshot ? snapshot.purchasePrice : 0;

        overviewValue += value;
        overviewPurchasePrice += purchasePrice;

        row.push(value);

        // Check for division by 0
        row2.push(purchasePrice !== 0 ? value / purchasePrice : 0);
      });

      row[1] = overviewValue;
      row2[1] = overviewPurchasePrice !== 0 ? overviewValue / overviewPurchasePrice : 0;

      rows.push(row);
      rows2.push(row2);
    });

    const header = [overviewName, ...names];

    return { totals: [header, rows], ratios: [header, rows2] };
  }
}

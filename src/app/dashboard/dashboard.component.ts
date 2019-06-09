import { Component, OnInit } from '@angular/core';
import { LineChartConfig } from '../google-charts/line-chart-config';
import { Deck } from '../model/deck';
import { DeckService } from '../service/deck.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {

  decks: Deck[];
 
  data: any[];
  config: LineChartConfig;
  elementId: string;

  data2: any[];
  config2: LineChartConfig;
  elementId2: string;

  constructor(private deckService: DeckService) { }
 
  ngOnInit() {
    this.config = new LineChartConfig('Total Value', 'in USD', 900, 800);
    this.elementId = 'linechart_material';

    this.config2 = new LineChartConfig('Purchase Price / Value', '', 900, 800);
    this.elementId2 = 'linechart_material2';

    this.getDecks();
  }
 
  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => { this.decks = decks; this.setChart() });
  }

  // Format data sent to google chart service
  setChart(): void {

    // Total Price Chart
    this.data = [[]];

    // Ratio Chart
    this.data2 = [[]];

    var names = [];

    names.push("Deck Overview");
    for (var _i = 1; _i < this.decks.length; ++_i) {
      names.push(this.decks[_i].name);
    }

    this.data[0] = names;
    this.data2[0] = names;

    var rows = [[]];
    var rows2 = [[]];

    var dates = [];

    // First deck must have most snapshots; create array of y axis points
    for (var _j = 0; _j < this.decks[1].deckSnapshots.length; ++_j) {
      dates.push(this.decks[1].deckSnapshots[_j].timestamp.substr(0,10));
    }

    for (var _j = 0; _j < dates.length; ++_j) {

      var deckOverviewValue = 0;
      var deckOverviewPurchasePrice = 0;

      var row = [];
      var row2 = [];

      row.push(dates[_j]);
      row2.push(dates[_j]);
      
      // K == 0, skip deck overview
      row.push(0);
      row2.push(0);

      // K == 1+
      for (var _k = 1; _k < this.decks.length; ++_k) {

        var numSnapshots = this.decks[_k].deckSnapshots.length;
        var snapshotIndex = _j;

        // Set invalid dates to zero values
        if (numSnapshots < dates.length && snapshotIndex < (dates.length - numSnapshots)) {
          row.push(0);
          row2.push(0);
        }
        else {

          // Adjust index on decks with fewer snapshots
          if (numSnapshots < dates.length) {
            snapshotIndex -= (dates.length - numSnapshots);
          }

          var value = this.decks[_k].deckSnapshots[snapshotIndex].value;
          deckOverviewValue += value;
          row.push(value);

          var purchasePrice = this.decks[_k].deckSnapshots[snapshotIndex].purchasePrice;
          deckOverviewPurchasePrice += purchasePrice;

          // Check for division by 0
          if (purchasePrice !== 0) {
            row2.push(value / purchasePrice);
          }
          else {
            row2.push(0);
          }
        }
      }

      row[1] = deckOverviewValue;
      rows[_j] = row;

      if (purchasePrice !== 0) {
        row2[1] = deckOverviewValue / deckOverviewPurchasePrice;
      }
      else {
        row2[1] = 0;
      }
      rows2[_j] = row2;
    }

    this.data[1] = rows;

    this.data2[1] = rows2;
  }
}

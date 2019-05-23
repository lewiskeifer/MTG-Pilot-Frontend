import { Component, OnInit } from '@angular/core';
import { Deck } from '../deck';
import { DeckService } from '../deck.service';
import { LineChartConfig } from '../google-charts/line-chart-config'
 
declare var google: any;

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

  constructor(private deckService: DeckService) { }
 
  ngOnInit() {
    this.config = new LineChartConfig('Total Value', 'in USD', 900, 1000);
    this.elementId = 'linechart_material';
    this.getDecks();
  }
 
  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => { this.decks = decks; this.setChart() });
  }

  setChart(): void {

    this.data = [[]];

    var names = [];
    for (var _i = 1; _i < this.decks.length; ++_i) {
      names.push(this.decks[_i].name);
    }

    this.data[0] = names;

    var rows = [[]];
    for (var _j = 0; _j < this.decks[1].deckSnapshots.length; ++_j) {
      var row = [];
      row.push(this.decks[1].deckSnapshots[_j].timestamp);
      for (var _k = 1; _k < this.decks.length; ++_k) {
        row.push(this.decks[_k].deckSnapshots[_j].value);
      }
      rows[_j] = row;
    }

    this.data[1] = rows;
  }
}
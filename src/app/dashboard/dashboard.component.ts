import { Component, OnInit } from '@angular/core';
import { Deck } from '../model/deck';
import { DeckService } from '../service/deck.service';
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

    // Format data sent to google chart service
    this.data = [[]];

    var names = [];

    names.push("Deck Overview");
    for (var _i = 1; _i < this.decks.length; ++_i) {
      names.push(this.decks[_i].name);
    }

    this.data[0] = names;

    var rows = [[]];

    // TODO ensure all snapshots are equal length or make this smarter
    for (var _j = 0; _j < this.decks[1].deckSnapshots.length; ++_j) {

      var deckOverviewValue = 0;
      var row = [];
      row.push(this.decks[1].deckSnapshots[_j].timestamp.substr(0,10));
      
      row.push(0);
      for (var _k = 1; _k < this.decks.length; ++_k) {
        var value = this.decks[_k].deckSnapshots[_j].value;
        deckOverviewValue += value;
        row.push(value);
      }

      row[1] = deckOverviewValue;
      rows[_j] = row;
    }

    this.data[1] = rows;
  }
}
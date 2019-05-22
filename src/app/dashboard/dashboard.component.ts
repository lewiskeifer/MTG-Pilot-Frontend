import { Component, OnInit } from '@angular/core';
import { Deck } from '../deck';
import { DeckService } from '../deck.service';
import { LineChartConfig } from '../google-charts/line-chart-config'
 
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
    this.config = new LineChartConfig('Total Value', 'in USD', 400, 800);
    this.elementId = 'linechart_material';
    this.getDecks();
  }
 
  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => { this.decks = decks; this.setChart() });
  }

  setChart(): void {
    console.log(this.decks);
    this.data = [
      ['Decks', this.decks[1].name, this.decks[2].name],
      [this.decks[1].deckSnapshots[0].timestamp, this.decks[1].deckSnapshots[0].value, this.decks[2].deckSnapshots[0].value],
      [this.decks[1].deckSnapshots[1].timestamp, this.decks[1].deckSnapshots[1].value, this.decks[2].deckSnapshots[1].value]
    ];
  }
}
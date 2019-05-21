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

  decks: Deck[] = [];
 
  data: any[];
  config: LineChartConfig;
  elementId: string;

  constructor(private deckService: DeckService) { }
 
  ngOnInit() {

    this.getDecks();

    // Linechart Data & Config
    this.data = [
    ['Decks', 'A', 'B'],
    ['1/1/19', 3, 2],
    ['2/1/19', 2, 2],
    ['3/1/19', 5, 4],
    ['4/1/19', 4, 5],
    ['5/1/19', 10, 7]];

    this.config = new LineChartConfig('Total Value', 'in USD', 400, 800);
    this.elementId = 'linechart_material';
  }
 
  getDecks(): void {
    this.deckService.getDecks()
      .subscribe(decks => this.decks = decks.slice(1, 5));
  }
}
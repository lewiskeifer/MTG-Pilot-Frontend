import { Component, OnInit } from '@angular/core';
import { LineChartConfig } from '../google-charts/line-chart-config';
import { Deck } from '../_model/deck';
import { User } from '../_model/user';
import { DeckService } from '../_service/deck.service';
import { HostListener } from '@angular/core';
import { SealedCollection } from '../_model/sealedCollection';
import { SealedService } from '../_service/sealed.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
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
      this.singlesTotalValueConfig = new LineChartConfig('Total Value', '', 950, 300);
      this.singlesRatioConfig = new LineChartConfig('Value / Purchase Price', '', 800, 300);
      this.sealedTotalValueConfig = new LineChartConfig('Total Value', '', 950, 300);
      this.sealedRatioConfig = new LineChartConfig('Value / Purchase Price', '', 800, 300);
    }
    else {
      this.singlesTotalValueConfig = new LineChartConfig('Total Value', '', 950, 900);
      this.singlesRatioConfig = new LineChartConfig('Value / Purchase Price', '', 950, 900);
      this.sealedTotalValueConfig = new LineChartConfig('Total Value', '', 950, 900);
      this.sealedRatioConfig = new LineChartConfig('Value / Purchase Price', '', 950, 900);
    }

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.getDecks();
    this.getSealedCollections();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenwidth = event.target.innerWidth;
    if (this.screenwidth < 1000) {
      this.singlesTotalValueConfig = new LineChartConfig('Total Value', '', 500, 400);
      this.singlesRatioConfig = new LineChartConfig('Value / Purchase Price', '', 500, 400);
      this.sealedTotalValueConfig = new LineChartConfig('Total Value', '', 500, 400);
      this.sealedRatioConfig = new LineChartConfig('Value / Purchase Price', '', 500, 400);
      this.setChart();
      this.setChart2();
    }
  }
 
  getDecks(): void {
    this.deckService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.decks = decks;
        if (this.decks.length > 1 && this.decks[1].deckSnapshots.length > 1) { 
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
        if (this.sealedCollection.length > 1 && this.sealedCollection[1].sealedCollectionSnapshots.length > 1) { 
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

    // Total Price Chart
    this.singlesTotalValueData = [[]];

    // Ratio Chart
    this.singlesRatioData = [[]];

    var names = [];

    names.push("Deck Overview");
    for (var _i = 1; _i < this.decks.length; ++_i) {
      names.push(this.decks[_i].name);
    }

    this.singlesTotalValueData[0] = names;
    this.singlesRatioData[0] = names;

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

      if (deckOverviewPurchasePrice !== 0) {
        row2[1] = deckOverviewValue / deckOverviewPurchasePrice;
      }
      else {
        row2[1] = 0;
      }
      rows2[_j] = row2;
    }

    this.singlesTotalValueData[1] = rows;

    this.singlesRatioData[1] = rows2;
  }

    // Format data sent to google chart service
    setChart2(): void {

      // Total Price Chart
      this.sealedTotalValueData = [[]];
  
      // Ratio Chart
      this.sealedRatioData = [[]];
  
      var names = [];
  
      names.push("Sealed Collection Overview");
      for (var _i = 1; _i < this.sealedCollection.length; ++_i) {
        names.push(this.sealedCollection[_i].name);
      }
  
      this.sealedTotalValueData[0] = names;
      this.sealedRatioData[0] = names;
  
      var rows = [[]];
      var rows2 = [[]];
  
      var dates = [];
  
      // First deck must have most snapshots; create array of y axis points
      for (var _j = 0; _j < this.sealedCollection[1].sealedCollectionSnapshots.length; ++_j) {
        dates.push(this.sealedCollection[1].sealedCollectionSnapshots[_j].timestamp.substr(0,10));
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
        for (var _k = 1; _k < this.sealedCollection.length; ++_k) {
  
          var numSnapshots = this.sealedCollection[_k].sealedCollectionSnapshots.length;
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
  
            var value = this.sealedCollection[_k].sealedCollectionSnapshots[snapshotIndex].value;
            deckOverviewValue += value;
            row.push(value);
  
            var purchasePrice = this.sealedCollection[_k].sealedCollectionSnapshots[snapshotIndex].purchasePrice;
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
  
        if (deckOverviewPurchasePrice !== 0) {
          row2[1] = deckOverviewValue / deckOverviewPurchasePrice;
        }
        else {
          row2[1] = 0;
        }
        rows2[_j] = row2;
      }
  
      this.sealedTotalValueData[1] = rows;
  
      this.sealedRatioData[1] = rows2;
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { GoogleLineChartService } from './google-line-chart-service';
import { LineChartConfig } from './line-chart-config';

declare var google: any;

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html'
})
export class LineChartComponent implements OnInit {

    @Input() data: any[];
    @Input() config: LineChartConfig;
    @Input() elementId: string;

    constructor(private _pieChartService: GoogleLineChartService) {}

    ngOnInit(): void {
        this._pieChartService.BuildLineChart(this.elementId, this.data, this.config); 
    }
}
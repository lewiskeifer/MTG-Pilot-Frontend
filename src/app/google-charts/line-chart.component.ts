import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { GoogleLineChartService } from './google-line-chart-service';
import { LineChartConfig } from './line-chart-config';

declare var google: any;

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html',
  standalone: false
})
export class LineChartComponent implements OnInit, OnChanges {

    @Input() data: any[];
    @Input() config: LineChartConfig;
    @Input() elementId: string;

    constructor(private _lineChartService: GoogleLineChartService) {}

    ngOnInit(): void {
      this.draw();
    }

    // Without this the chart is drawn once and never again, so filtering and resizing do nothing
    ngOnChanges(): void {
      this.draw();
    }

    private draw(): void {
      if (this.data && this.config && this.elementId) {
        this._lineChartService.BuildLineChart(this.elementId, this.data, this.config);
      }
    }
}

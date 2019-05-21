import { GoogleChartsBaseService } from './google-charts-base-service';
import { Injectable } from '@angular/core';
import { LineChartConfig } from './line-chart-config';

declare var google: any;

@Injectable()
export class GoogleLineChartService extends GoogleChartsBaseService {

  constructor() { super(); }

  public BuildLineChart(elementId: string, data: any[], config: LineChartConfig) : void {  

    var chartFunc = () => { return new google.charts.Line(document.getElementById(elementId)); };
    var options = {
      chart: {
        title: config.title,
        subtitle: config.subtitle
      },
      width: config.width,
      height: config.height
      };

    this.buildChart(data, chartFunc, options);
  }
}
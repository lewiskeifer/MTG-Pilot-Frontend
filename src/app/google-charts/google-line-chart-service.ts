import { GoogleChartsBaseService } from './google-charts-base-service';
import { Injectable } from '@angular/core';
import { LineChartConfig } from './line-chart-config';

declare var google: any;

@Injectable()
export class GoogleLineChartService extends GoogleChartsBaseService {

  constructor() { super(); }

  public BuildLineChart(elementId: string, data: any[], config: LineChartConfig) : void {  

    var chartFunc = () => { return new google.visualization.LineChart(document.getElementById(elementId)); };
    const options = {
      chartArea: {
        left: 70,
        top: 20,
        bottom: 70,
        width: '65%'
      },
      width: config.width,
      height: window.innerHeight * 0.8,
      vAxis: config.vAxisFormat ? { format: config.vAxisFormat } : {}
    };

    this.buildChart(data, chartFunc, options);
  }

}
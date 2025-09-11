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
      title: config.title,
      titleTextStyle: {
        alignment: 'center',
        fontSize: 18,
        bold: true
      },
      chartArea: {
        left: 70,      // Reduce from default (~80)
        top: 70,
        bottom: 70,
      },
      width: config.width,
      height: window.innerHeight * 0.8
    };

    this.buildChart(data, chartFunc, options);
  }

}
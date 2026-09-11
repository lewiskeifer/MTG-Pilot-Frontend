import { GoogleChartsBaseService } from './google-charts-base-service';
import { Injectable } from '@angular/core';
import { LineChartConfig } from './line-chart-config';
import { CHART_INK } from './chart-palette';

declare var google: any;

@Injectable()
export class GoogleLineChartService extends GoogleChartsBaseService {

  constructor() { super(); }

  public BuildLineChart(elementId: string, data: any[], config: LineChartConfig): void {

    const chartFunc = () => { return new google.visualization.LineChart(document.getElementById(elementId)); };
    const seriesCount = (data[0] || []).length;
    const valueFormat = config.vAxisFormat || '#,##0.000';

    const options = {
      chartArea: {
        left: 80,
        top: seriesCount > 1 ? 48 : 20,
        bottom: 60,
        // Room on the right for the direct labels on each line's final point
        width: '80%'
      },
      width: config.width,
      height: window.innerHeight * 0.8,
      backgroundColor: CHART_INK.surface,
      colors: config.colors,
      lineWidth: 2,
      pointSize: 0,

      /*
       * focusTarget 'category' is what makes a specific date readable: the pointer only has to
       * find the date, and one tooltip then lists every series at that date. The default
       * ('datum') requires landing on a single point out of thousands.
       */
      focusTarget: 'category',
      crosshair: { trigger: 'both', orientation: 'vertical', color: CHART_INK.muted, opacity: 0.5 },
      tooltip: { trigger: 'both' },

      // Drag across the plot to zoom into a date range; right-click restores the full range
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 0.005
      },

      // A single series is named by the chart title, so it needs no legend box
      legend: seriesCount > 1
        ? { position: 'top', alignment: 'start', maxLines: 2, textStyle: { color: CHART_INK.secondary, fontSize: 12 } }
        : 'none',

      annotations: {
        textStyle: { fontSize: 11, color: CHART_INK.secondary },
        stem: { color: 'transparent', length: 4 },
        highContrast: false
      },

      hAxis: {
        format: 'MMM d, yyyy',
        maxTextLines: 1,
        textStyle: { color: CHART_INK.muted, fontSize: 11 },
        gridlines: { color: 'transparent' },
        baselineColor: CHART_INK.baseline
      },

      vAxis: {
        format: config.vAxisFormat ? config.vAxisFormat : undefined,
        textStyle: { color: CHART_INK.muted, fontSize: 11 },
        gridlines: { color: CHART_INK.gridline, count: 6 },
        minorGridlines: { count: 0 },
        baselineColor: CHART_INK.baseline
      }
    };

    this.buildChart(data, chartFunc, options, valueFormat);
  }

}

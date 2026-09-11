declare var google: any;

export class GoogleChartsBaseService {

  constructor() {
    google.charts.load('current', { packages: ['corechart'] });
  }

  /*
   * data[0] is the series names, data[1] the rows, each of which is a Date followed by one
   * number per series.
   *
   * The date column is a real date rather than a string: a string column makes every one of the
   * ~500 timestamps its own discrete category, which crams the axis and disables drag-to-zoom.
   *
   * Each series also gets an annotation column, populated only on its last row, so every line
   * carries its current value at the right edge instead of relying on hover alone.
   */
  protected buildChart(data: any[], chartFunc: any, options: any, valueFormat: string): void {

    const draw = () => {

      const names: string[] = data[0] || [];
      const rows: any[][] = data[1] || [];

      const datatable = new google.visualization.DataTable();
      datatable.addColumn('date', 'Date');

      for (var _i = 0; _i < names.length; ++_i) {
        datatable.addColumn('number', names[_i]);
        datatable.addColumn({ type: 'string', role: 'annotation' });
      }

      const formatter = valueFormat ? new google.visualization.NumberFormat({ pattern: valueFormat }) : null;
      const labelled = this.selectLabelledSeries(rows, names.length, options);

      for (var _j = 0; _j < rows.length; ++_j) {

        const source = rows[_j];
        const row = [source[0]];
        const isLast = _j === rows.length - 1;

        for (var _k = 1; _k < source.length; ++_k) {
          const value = source[_k];
          row.push(value);
          row.push(isLast && value !== null && labelled.has(_k - 1) ? this.formatValue(value, valueFormat) : null);
        }

        datatable.addRow(row);
      }

      if (formatter) {
        // Numeric columns are interleaved with their annotation columns
        for (var _c = 1; _c < datatable.getNumberOfColumns(); _c += 2) {
          formatter.format(datatable, _c);
        }
      }

      chartFunc().draw(datatable, options);
    };

    google.charts.setOnLoadCallback(draw);
  }

  /*
   * Labels are selective. Series whose final points sit within a label's height of each other
   * would print on top of one another, so of any such cluster only the highest is labelled and
   * the rest stay reachable through the legend, the tooltip and the values table.
   */
  private selectLabelledSeries(rows: any[][], seriesCount: number, options: any): Set<number> {

    const labelled = new Set<number>();
    if (rows.length === 0) {
      return labelled;
    }

    var min = Number.POSITIVE_INFINITY;
    var max = Number.NEGATIVE_INFINITY;
    rows.forEach(row => {
      for (var _i = 1; _i <= seriesCount; ++_i) {
        if (row[_i] === null || row[_i] === undefined) {
          continue;
        }
        min = Math.min(min, row[_i]);
        max = Math.max(max, row[_i]);
      }
    });

    const span = max - min;
    if (!isFinite(span) || span <= 0) {
      for (var _s = 0; _s < seriesCount; ++_s) {
        labelled.add(_s);
      }
      return labelled;
    }

    const plotHeight = Math.max(1, options.height - options.chartArea.top - options.chartArea.bottom);
    const minSeparation = span * (14 / plotHeight);

    const last = rows[rows.length - 1];
    const finals = [];
    for (var _f = 0; _f < seriesCount; ++_f) {
      const value = last[_f + 1];
      if (value !== null && value !== undefined) {
        finals.push({ index: _f, value: value });
      }
    }
    finals.sort((a, b) => b.value - a.value);

    var placed = Number.POSITIVE_INFINITY;
    finals.forEach(entry => {
      if (placed - entry.value >= minSeparation) {
        labelled.add(entry.index);
        placed = entry.value;
      }
    });

    return labelled;
  }

  private formatValue(value: number, valueFormat: string): string {
    const rounded = valueFormat && valueFormat.indexOf('$') === 0
      ? Math.round(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      : value.toFixed(2);
    return ' ' + rounded;
  }
}

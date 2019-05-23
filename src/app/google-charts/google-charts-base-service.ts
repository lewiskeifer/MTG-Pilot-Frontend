declare var google: any;

export class GoogleChartsBaseService {
  
  constructor() { 
    google.charts.load('current', {'packages':['line']});
  }

  protected buildChart(data: any[], chartFunc: any, options: any) : void {

    var func = (datatable, chartFunc, options) => {

      var datatable = new google.visualization.DataTable();
      datatable.addColumn('string', 'Date');

      for (var _i = 0; _i < data[0].length; ++_i) {
        datatable.addColumn('number', data[0][_i]);
      }

      for (var _j = 0; _j < data[1].length; ++_j) {
        var row = [];
        for (var _k = 0; _k < data[1][_j].length; _k++) {
          row.push(data[1][_j][_k]);
        }
        datatable.addRow(row);
      }

      chartFunc().draw(datatable, options);

    };   

    var callback = () => func(data, chartFunc, options);
    google.charts.setOnLoadCallback(callback);
  }
}
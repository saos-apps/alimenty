(function (window) {
    'use strict';

    var barChart = { name: "barChart based on c3.js" };

    barChart.generate = function (data, dataName, dataLength) {

        var vis = prepareVisData(sortData(data), dataName, dataLength);

		var chart = c3.generate({
			bindto: '#oneDimVisualisation',
			size: {
				height: 500
			},
			data: {
				columns: [
					vis.viscolumns
				],
				type: 'bar'
			},
			axis: {
				x: {
					type: 'category',
					categories: vis.viscategories,
					tick: {
						rotate: 30,
						//multiline: false
					},
				},
				y : {
					tick: {
						format: function (d) { return d + " %"; }
					},
					max : 100,
					padding : {
						top : 0
					}
				}
			},
			bar: {
				width: {
					ratio: 0.5
				}
			}
		});
    };

	if (typeof define === 'function' && define.amd) {
        define("barChart", ["d3"], barChart);
    } else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
        module.exports = barChart;
    } else {
        window.barChart = barChart;
    }
})(window);

function sortData(data) {
	var sortable = [];
	for (var property in data)
		  sortable.push([property, data[property]]);
	sortable.sort(function(a, b) { return b[1] - a[1]; });
	return sortable;
}

function prepareVisData(data, dataName, dataLength) {
	var vis = {};
	vis.viscolumns = [];
	vis.viscategories = [];
	vis.viscolumns[0] = mapping[dataName];

	$.each(data, function(i, entry) {
		var property = entry[0];
		var value = entry[1];
		var normalizedValue = (value/dataLength*100).toFixed(2);
		vis.viscategories[vis.viscategories.length] = property;
		vis.viscolumns[vis.viscolumns.length] = normalizedValue;
	});
	return vis;
}
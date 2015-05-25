(function (window) {
    'use strict';

    var stackedBarChart = { name: "StackedBarChart based on c3.js" };
    stackedBarChart.generate = function(data, dataName1, dataName2, categories, dataLength) {
    	var vis = prepareStackedVisData(data, dataName1, dataName2, categories, dataLength);
		var chart = c3.generate({
			bindto: '#twoDimVisualisation',
			size: {
				height: 500
			},
			data: {
				columns: vis.viscolumns,
				type: 'bar',
				groups: [
					vis.groups
				]
			},
			axis: {
				x: {
					type: 'category',
					categories: vis.viscategories,
					tick: {
						rotate: 45,
						//multiline: false
					}
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
			}
		});
    };

    if (typeof define === 'function' && define.amd) {
        define("stackedBarChart", ["d3"], stackedBarChart);
    } else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
        module.exports = stackedBarChart;
    } else {
        window.stackedBarChart = stackedBarChart;
    }
})(window);

function stackedBarChart() {
	
}

function countDependencies(data, dataName1, dataName2, categories, dataLength) {
	var dependencies = {};
	var mainCategoryCounter = {};

	if (!categories[dataName1]) return null;
	$.each(categories[dataName1], function(i, mainCategory) {

		dependencies[mainCategory] = {};
		mainCategoryCounter[mainCategory] = 0;

		$.each(categories[dataName2], function(i, subCategory) {
			dependencies[mainCategory][subCategory] = 0;
		});
	});
	$.each(data, function(i, entry) {
		mainCategoryCounter[entry[dataName1]] += 1;
		dependencies[entry[dataName1]][entry[dataName2]] += 1;
	});

	$.each(dependencies, function(dependency, dependencyValue) {
		$.each(dependencyValue, function(property, propertyValue) {
			dependencyValue[property] = (propertyValue/mainCategoryCounter[dependency]*100).toFixed(2);
		});
	});
	return dependencies;
}

function prepareStackedVisData(data, dataName1, dataName2, categories, dataLength) {
	var vis = {};
	var dependencies = countDependencies(data, dataName1, dataName2, categories, dataLength);
	vis.groups = stackedBarChartGroups(dependencies);
	vis.viscategories = stackedBarChartCategories(dependencies);
	vis.viscolumns = stackedBarChartColumns(dependencies, vis.groups, vis.viscategories);

	return vis;
}

function stackedBarChartColumns(data, groups, categories) {
	var columns = [];
	$.each(groups, function(i, group) {
		columns.push(addGroupData(data, group, categories));
	});
	return columns;
}

function addGroupData(data, group, categories) {
	var groupArray = [];
	groupArray.push(group);
	$.each(categories, function(i, category) {
		groupArray.push(data[category][group]);
	});
	return groupArray;
}

function stackedBarChartGroups(data) {
	var obj = data[Object.keys(data)[0]];
	var groups = [];
	$.each(obj, function(property) {
		groups.push(property);
	});
	return groups;
}

function stackedBarChartCategories(data) {
	var categories = [];
	$.each(data, function(property) {
		categories.push(property);
	});
	return categories;
}
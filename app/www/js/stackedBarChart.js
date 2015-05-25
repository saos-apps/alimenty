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
			},
			tooltip: {
			  	format: {
					value: function (value, ratio, id) {
						return value + "%";
					}
				},
			  	contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
				  	var $$ = this, config = $$.config,
					  	titleFormat = config.tooltip_format_title || defaultTitleFormat,
					  	nameFormat = config.tooltip_format_name || function (name) { return name; },
					  	valueFormat = config.tooltip_format_value || defaultValueFormat,
					  	text, i, title, value, name, bgcolor, titleCounter;

				  	for (i = 0; i < d.length; i++) {
					  	if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

					  	if (! text) {
						  	title = titleFormat ? titleFormat(d[i].x) : d[i].x;
						  	titleCounter = vis.counter[title];
						  	title += " (" + titleCounter + ")"; 
						  	text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
					  	}

					  	name = nameFormat(d[i].name);
					  	value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
					  	bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

					  	text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
					  	text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
					  	text += "<td class='value'>" + (d[i].value*Number(titleCounter)/100).toFixed(0);
					  	text += " (" + value + ")</td>";
					  	text += "</tr>";
				  	}
				  	return text + "</table>";
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
	});

	$.each(data, function(i, entry) {
		if (mainCategoryCounter[entry[dataName1]]/dataLength <= 0.01 || entry[dataName1] === '?') {
			if (dependencies.inne === undefined) {
				dependencies.inne = {};
				$.each(categories[dataName2], function(i, subCategory) {
					dependencies.inne[subCategory] = 0;
				});
				mainCategoryCounter.inne = 0;
			}
			dependencies.inne[entry[dataName2]] += 1;
			mainCategoryCounter.inne += 1;
			delete dependencies[entry[dataName1]];
		}
		else dependencies[entry[dataName1]][entry[dataName2]] += 1;
	});

	$.each(dependencies, function(dependency, dependencyValue) {
		$.each(dependencyValue, function(property, propertyValue) {
			dependencyValue[property] = (propertyValue/mainCategoryCounter[dependency]*100).toFixed(2);
		});
	});
	var obj = {};
	obj.dependencies = dependencies;
	obj.counter = mainCategoryCounter;
	return obj;
}

function prepareStackedVisData(data, dataName1, dataName2, categories, dataLength) {
	var vis = {};
	var countedDependencies = countDependencies(data, dataName1, dataName2, categories, dataLength);
	var dependencies = countedDependencies.dependencies;
	vis.groups = stackedBarChartGroups(dependencies);
	vis.viscategories = stackedBarChartCategories(dependencies);
	vis.viscolumns = stackedBarChartColumns(dependencies, vis.groups, vis.viscategories);
	vis.counter = countedDependencies.counter;

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
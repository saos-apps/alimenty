
	var networkOutputBinding = new Shiny.OutputBinding();
	var neighbours = [];
	var mapping = {
		isAppeal : "Apelacja",
		reason : "Powód sprawy",
		result : "Wyrok sprawy",
		plaintiffSex : "Płeć powoda",
		defendantSex : "Płec pozwanego"
	};

	$.extend(networkOutputBinding, {

		find: function(scope) {
			return $(scope).find('.shiny-network-output');
		},
		
		renderValue: function(el, data) {
			console.log(data)
			var dataLength = data.length;
			if (data.type === 'oneDim') {
				var dataName = data.name;
				var barChartData = data.data[dataName];
				barChart(barChartData, dataName, dataLength);	
			}	
			else if (data.type === 'twoDim') {
				var stackedBarChartData = data.data;
				var name_1 = data.name_1;
				var name_2 = data.name_2;
				var categories = data.categories;
				stackedBarChart(stackedBarChartData, name_1, name_2, categories, dataLength);
			}
		}
	});

	function barChart(data, dataName, dataLength) {
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
	}

	function stackedBarChart(data, dataName1, dataName2, categories, dataLength) {
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
			}
		});
	}

	function sortData(data) {
		var sortable = [];
		for (var property in data)
			  sortable.push([property, data[property]]);
		sortable.sort(function(a, b) { return b[1] - a[1]; });
		return sortable;
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

	Shiny.outputBindings.register(networkOutputBinding, 'pawluczuk.networkbinding');
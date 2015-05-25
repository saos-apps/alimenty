
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
		var dataLength = data.length;
		if (data.type === 'oneDim') {
			var dataName = data.name;
			var barChartData = data.data[dataName];
			barChart.generate(barChartData, dataName, dataLength);	
		}	
		else if (data.type === 'twoDim') {
			var stackedBarChartData = data.data;
			var name_1 = data.name_1;
			var name_2 = data.name_2;
			var categories = data.categories;
			stackedBarChart.generate(stackedBarChartData, name_1, name_2, categories, dataLength);
		}
	}
});

Shiny.outputBindings.register(networkOutputBinding, 'pawluczuk.networkbinding');
var alimony = require('./alimony.json');
var http = require('https');
var async = require('async-series');
var fs = require('fs');
var cheerio = require('cheerio');

var alimonyArray = [];
var functions = [];

for (var i = 0; i < alimony.length; i++) {
	functions.push(addJudgment(alimony[i], i));
}

async(functions, function() {
	console.log("Got all data.");
	fs.writeFile('alimonyFull.json', JSON.stringify(alimonyArray), function (err) {
		if (err) throw err;
		console.log('It\'s saved!');
	});
});

function addJudgment(judgment, index) {
	if (!index%10) console.log('Processing index: ' + index);
	return function(callback) {
		var url = 'https://saos-test.icm.edu.pl/api/judgments/' + judgment.judgmentId;
			http.get(url, function(res) {
			    var body = '';

			    res.on('data', function(chunk) {
			        body += chunk;
			    });

			    res.on('end', function() {
			        var judgmentFull = JSON.parse(body);
			        judgment.text = getResult(judgmentFull.data.textContent);
			        alimonyArray.push(judgment);
			        callback();
			    });
			}).on('error', function(e) {
			      console.log("Got error: ", e);
			});
	};
}

function getResult(text) {
	var wyrok = text.split("uzasadnieni");
	$ = cheerio.load(wyrok[0]);
	return $('div').first().text();
}
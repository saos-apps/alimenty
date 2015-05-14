var alimenty = require('./alimonyFull.json');
var fs = require('fs');

function analyse() {

	alimenty.forEach(function(entry) {

		entry.text = entry.text.toLowerCase();
		//var match = entry.text.match(/przeciwko.\w+.*\w+.\s+o/g);
		var down = entry.text.indexOf('o obniżenie alimentów');
		var up = entry.text.indexOf('o podwyższenie alimentów');
		var dismissal = entry.text.indexOf('o uchylenie');
		var alimony = entry.text.indexOf('o alimenty');
		var isAppeal = entry.text.indexOf('apelacj');

		entry.monika = {};

		// isAppeal - czy jest to apelacja
		// dostępne wyniki : true, false
		entry.monika.isAppeal = (isAppeal > -1) ? true : false;

		// reason - powód sprawy
		// dostępne wyniki : ?, obniżenie, podwyższenie, alimenty lub pary, uchylenie
		//if (!(up > -1 || down > -1 || alimony > - 1))
		//	entry.monika.reason = '?';
		if (down > -1)
			{
				if (entry.monika.reason === undefined)
					entry.monika.reason = 'obniżenie';
				else entry.monika.reason += ' i obniżenie';
			}
		if (up > -1)
			{
				if (entry.monika.reason === undefined)
					entry.monika.reason = 'podwyższenie';
				else entry.monika.reason += ' i podwyższenie';
			}
		if (dismissal > -1)
			{
				if (entry.monika.reason === undefined)
					entry.monika.reason = 'uchylenie';
				else entry.monika.reason += ' i uchylenie';
			}
		if (alimony > -1)
			{
				if (entry.monika.reason === undefined)
					entry.monika.reason = 'alimenty';
				else entry.monika.reason += ' i alimenty';
			}
		if (entry.monika.reason === undefined)
			entry.monika.reason = '?';
		// result - wyrok który zapadł
		// dostępne wyniki : ?, obniża, podwyższa, oddala
		entry.monika.result = getResult(entry.text, entry.monika.reason);
	});
}

function getResult(text, reason) {
	//console.log('up: ' + up + '\tdown: ' + down + '\tchanged: ' + changed);
	//if ( (up && down) || (up&&dismissed) || (down&&dismissed) )
	//	return '?';
	if (isUp(text, reason))
		return 'podwyższa alimenty';
	if (isDown(text, reason))
		return 'obniża alimenty';
	if (isChanged(text, reason))
		return (isChanged(text, reason) === 1) ? 'podwyższa alimenty' : 'obniża alimenty';
	if (isDismissed(text, reason))
		return 'uchyla obowiązek alimentacyjny';
	if (isCanceled(text, reason))
		return 'oddala wnioski/apelację';
	if (isAwarded(text, reason))
		return 'zasądza (wprowadza) alimenty';
	return '?';
}

function isChanged(text, reason) {

	// zmienia^((?!(punkt|punkcie|pkt)).)*$\D*po\D*(\d+)\D*po\D*(\d+)
	var re = /zmienia.*po\s.*(\d+).*po\s.*(\d+)/ig;
	var re1 = /\spo\s(\d+).*\szamiast.*\spo\s(\d+)/;
	var re2 = /w miejsce.*\spo\s(\d+).*\spo\s(\d+)/;
	var re3 = /\spo\s(\d+).*\sw miejsce.*\spo\s(\d+)/;
	var re4 = /w kwocie.*(\d+).*w miejsce/;
	if (text.match(re1))
	{
		var found = text.match(re1);
		if ( Number(found[1]) - Number(found[2]) < 0 )
			return 2;
		else return 1;
	}
	else if (text.match(re2))
	{
		var found = text.match(re2);
		if ( Number(found[1]) - Number(found[2]) < 0 )
			return 1;
		else return 2;
	}
	else if (text.match(re3))
	{
		var found = text.match(re3);
		if ( Number(found[1]) - Number(found[2]) < 0 )
			return 2;
		else return 1;
	}
	else if (text.match(re4) && reason === 'obniżenie')
		return 2;
	else if (text.match(re4) && reason === 'podwyższenie')
		return 1;
	else if (text.indexOf('zmienia') > -1 && text.indexOf('zasądza') > -1 && reason === "obniżenie")
		return 2;
	else if (text.indexOf('zmienia') > -1 && text.indexOf('zasądza') > -1 && reason === "podwyższenie")
		return 1;
	return false;
}

function isUp(text, reason) {
	if (text.indexOf('podwyższa') > -1)
		return true;
	else if (text.indexOf('podwyższone alimenty') > -1)
		return true;
	else if (text.indexOf('podnosi') > -1)
		return true;
	else if (reason === 'podwyższenie' && text.indexOf('zasądza') > -1 &&
		text.indexOf('oddala powództwo') === -1 && text.indexOf('oddala apelację') === -1 &&
		text.indexOf('powództwo oddala') === -1)
		return true;
	else return false;
}

function isDown(text, reason) {
	if (text.indexOf('obniża') > -1)
		return true;
	else if (text.indexOf('obniżone alimenty') > -1)
		return true;
	else if (reason === 'obniżenie' && text.indexOf('zasądza') > -1 &&
		text.indexOf('oddala powództwo') === -1 && text.indexOf('oddala apelację') === -1 &&
		text.indexOf('powództwo oddala') === -1)
		return true;
	else return false;
}

function isDismissed(text, reason) {
	if (reason.indexOf('uchylenie') > -1 && text.indexOf('uchyla') > -1)
		return true;
	else return false;
}

function isCanceled(text, reason) {
	if ( ( text.indexOf('oddala powództwo') > -1 || text.indexOf('oddala apelację') > -1 ||
		text.indexOf('powództwo oddala') > -1 || text.indexOf('umarza') ) && 
		text.indexOf('zasądza') === -1 &&
		text.indexOf('podwyższa') === -1 && text.indexOf('obniża') === -1 )
		return true;
	else return false;
}

function isAwarded(text, reason) {
	if (reason.indexOf('alimenty') > -1 && text.indexOf('zasądza') > -1)
		return true;
	else if (text.indexOf('zasądza') > -1 && text.indexOf('obniża') === -1 && 
		text.indexOf('podwyższa') === -1 &&
		text.indexOf('oddala powództwo') === -1 && text.indexOf('oddala apelację') === -1 &&
		text.indexOf('powództwo oddala') === -1)
		return true;
	else return false;
}

function compare() {

	//console.log('id: ' + entry.judgmentId + ' reason: ' + entry.monika.reason);
	resultCounter = {};
	reasonCounter = {};
	alimenty.forEach(function(entry) {

		//console.log('id: ' + entry.judgmentId + ' reason: ' + entry.monika.reason);

		/*if (entry.monika.isAppeal !== entry.value.isAppeal)
		{
			console.log(entry.judgmentId);
			console.log('analyse: ' + entry.value.isAppeal);
			console.log('monika: ' + entry.monika.isAppeal);
		}

		if (entry.monika.result === 'podwyższa' && entry.value.result !== entry.monika.result) {
			console.log('podwyższa: ' + entry.judgmentId);
			console.log('analyse: ' + entry.value.result);
			console.log(entry.monika);
		}

		if (entry.monika.result === 'obniża' && entry.value.result !== entry.monika.result) {
			console.log('obniża: ' + entry.judgmentId);
			console.log('analyse: ' + entry.value.result);
			console.log(entry.monika);
		}
		if (entry.monika.result === 'oddala' && entry.value.result !== 'oddala') {
			console.log('oddala: ' + entry.judgmentId);
			console.log('analyse: ' + entry.value.result);
			console.log(entry.monika);
		}

		if (entry.monika.result.indexOf('?') > -1) {
			console.log('\nid: ' + entry.judgmentId);
			console.log('analyse: ' + entry.value.result);
			console.log(entry.monika);
		}

		*/

		if ( resultCounter[entry.monika.result] === undefined ) {
			resultCounter[entry.monika.result] = 1;
		}
		else resultCounter[entry.monika.result] += 1;

		if ( reasonCounter[entry.monika.reason] === undefined ) {
			reasonCounter[entry.monika.reason] = 1;
		}
		else reasonCounter[entry.monika.reason] += 1;

		if ( entry.monika.result !== entry.value.result ) {
			console.log('ID: ' + entry.judgmentId + '\tchlopaki: ' + entry.value.result
				+ '\tmoje: ' + entry.monika.result);
		}
	});
	console.log("\nREASONS: ");
	console.log(reasonCounter);

	console.log("\nRESULTS: ");
	console.log(resultCounter);

	fs.writeFile('alimonyFullMonika.json', JSON.stringify(alimenty), function (err) {
		if (err) throw err;
		console.log('It\'s saved!');
	});

}

analyse();
compare();
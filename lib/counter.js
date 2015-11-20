'use strict';
var register = require('./register');
var type = 'counter';
var isNumber = require('./util').isNumber;

function Counter(obj) {
	if(!obj.help) {
		throw new Error('Missing mandatory help parameter');
	}
	if(!obj.name) {
		throw new Error('Missing mandatory name parameter');
	}
	this.name = obj.name;
	this.values = [{
		value: 0,
		labels: obj.labels
	}];
	this.help = obj.help;
	register.registerMetric(this);
}

Counter.prototype.inc = function(incValue) {
	if(incValue && !isNumber(incValue)) {
		throw new Error('Value is not a valid number', incValue);
	}
	if(incValue < 0) {
		throw new Error('It is not possible to decrease a counter');
	}
	this.values[0].value = this.values[0].value += incValue || 1;
};

Counter.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type: type,
		values: this.values
	};
};

module.exports = Counter;

'use strict';
var register = require('./register');
var type = 'counter';

function Counter(obj) {
	this.name = obj.name;
	this.values = [{
		value: 0,
		labels: obj.labels
	}];
	this.help = obj.help;
	register.registerMetric(this);
}

Counter.prototype.inc = function(incValue) {
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

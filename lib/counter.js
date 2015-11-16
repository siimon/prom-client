'use strict';
var register = require('./register');
var type = 'counter';

function Counter(obj) {
	this.name = obj.name;
	this.value = 0;
	this.labels = obj.labels;
	this.help = obj.help;
	register.registerMetric(this);
}

Counter.prototype.inc = function() {
	this.value = this.value += 1;
};

Counter.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type: type,
		labels: this.labels,
		value: this.value
	};
};

module.exports = Counter;

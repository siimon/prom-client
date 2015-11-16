'use strict';

var register = require('./register');
var type = 'gauge';

function Gauge(obj) {
	this.name = obj.name;
	this.value = 0;
	this.labels = obj.labels;
	this.help = obj.help;
	register.registerMetric(this);
}

Gauge.prototype.set = function(value) {
	this.value = value;
};

Gauge.prototype.inc = function(val) {
	this.value += val || 1;
};

Gauge.prototype.dec = function(val) {
	this.value -= val || 1;
};

Gauge.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type: type,
		labels: this.labels,
		value: this.value
	};
};

Gauge.prototype.reset = function() {
	this.value = 0;
};

module.exports = Gauge;

'use strict';

var register = require('./register');
var type = 'gauge';

function Gauge(obj) {
	this.name = obj.name;
	this.values = [{
		value: 0,
		labels: obj.labels
	}];
	this.help = obj.help;
	register.registerMetric(this);
}

Gauge.prototype.set = function(value) {
	this.values[0].value = value;
};

Gauge.prototype.inc = function(val) {
	this.values[0].value += val || 1;
};

Gauge.prototype.dec = function(val) {
	this.values[0].value -= val || 1;
};

Gauge.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type: type,
		values: this.values
	};
};

Gauge.prototype.reset = function() {
	this.values[0].value = 0;
};

module.exports = Gauge;

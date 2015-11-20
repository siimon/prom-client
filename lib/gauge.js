'use strict';

var register = require('./register');
var type = 'gauge';

var isNumber = require('./util').isNumber;
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
	if(!isNumber(value)) {
		throw new Error('Value is not a valid number', value);
	}
	this.values[0].value = value;
};

Gauge.prototype.inc = function(val) {
	this.set(this._getValue() + (val || 1));
};

Gauge.prototype.dec = function(val) {
	this.set(this._getValue() - (val || 1));
};

Gauge.prototype.setToCurrentTime = function() {
	this.set(new Date().getTime());
};

Gauge.prototype.startTimer = function() {
	var start = new Date();
	var gauge = this;
	return function() {
		var end = new Date();
		gauge.set((end - start) / 1000);
	};
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

Gauge.prototype._getValue = function() {
	return this.values[0].value;
};

module.exports = Gauge;

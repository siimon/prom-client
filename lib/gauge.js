/**
 * Gauge metric
 */
'use strict';

var register = require('./register');
var type = 'gauge';

var isNumber = require('./util').isNumber;

/**
 * Gauge constructor
 * @param {object} obj - Configuration
 * @constructor
 */
function Gauge(obj) {
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

/**
 * Set a gauge to a value
 * @param {float} value - Value to set the gauge to, must be positive
 * @returns {void}
 */
Gauge.prototype.set = function(value) {
	if(!isNumber(value)) {
		throw new Error('Value is not a valid number', value);
	}
	this.values[0].value = value;
};

/**
 * Increment a gauge value
 * @param {float} value - Value to increment - if omitted, increment with 1
 * @returns {void}
 */
Gauge.prototype.inc = function(value) {
	this.set(this._getValue() + (value || 1));
};

/**
 * Decrement a gauge value
 * @param {float} value - Value to decrement - if omitted, decrement with 1
 * @returns {void}
 */
Gauge.prototype.dec = function(value) {
	this.set(this._getValue() - (value || 1));
};

/**
 * Set the gauge to current unix epoch
 * @returns {void}
 */
Gauge.prototype.setToCurrentTime = function() {
	this.set(new Date().getTime());
};

/**
 * Start a timer
 * @returns {function} - Invoke this function to set the duration in seconds since you started the timer.
 * @example
 * var done = gauge.startTimer();
 * makeXHRRequest(function(err, response) {
 *	done(); //Duration of the request will be saved
 * });
 */
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

/**
 * Reset the value of the gauge to 0
 * @returns {void}
 */
Gauge.prototype.reset = function() {
	this.values[0].value = 0;
};

Gauge.prototype._getValue = function() {
	return this.values[0].value;
};

module.exports = Gauge;

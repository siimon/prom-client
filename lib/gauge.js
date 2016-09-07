/**
 * Gauge metric
 */
'use strict';

var register = require('./register');
var type = 'gauge';

var isNumber = require('./util').isNumber;
var extend = require('util-extend');
var createValue = require('./util').setValue;
var getProperties = require('./util').getPropertiesFromObj;
var getLabels = require('./util').getLabels;
var hashObject = require('./util').hashObject;
var validateMetricName = require('./validation').validateMetricName;
var validateLabels = require('./validation').validateLabel;
var validateLabelNames = require('./validation').validateLabelName;

/**
 * Gauge constructor
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {array} labels - Array with strings, all label keywords supported
 * @constructor
 */
function Gauge(name, help, labels) {
	if(!help) {
		throw new Error('Missing mandatory help parameter');
	}
	if(!name) {
		throw new Error('Missing mandatory name parameter');
	}
	if(!validateMetricName(name)) {
		throw new Error('Invalid metric name');
	}
	if(!validateLabelNames(labels)) {
		throw new Error('Invalid label name');
	}

	this.name = name;
	this.labelNames = labels || [];
	this.hashMap = {};

	this.help = help;
	register.registerMetric(this);
}

/**
 * Set a gauge to a value
 * @param {object} labels - Object with labels and their values
 * @param {Number} value - Value to set the gauge to, must be positive
 * @returns {void}
 */
Gauge.prototype.set = function(labels, value) {
	if(isNumber(labels)) {
		return set.call(this, null)(labels);
	}
	return set.call(this, labels)(value);
};

/**
 * Increment a gauge value
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to increment - if omitted, increment with 1
 * @returns {void}
 */
Gauge.prototype.inc = function(labels, value) {
	inc.call(this, labels)(value);
};


/**
 * Decrement a gauge value
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to decrement - if omitted, decrement with 1
 * @returns {void}
 */
Gauge.prototype.dec = function(labels, value) {
	dec.call(this, labels)(value);
};

/**
 * Set the gauge to current unix epoch
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @returns {void}
 */
Gauge.prototype.setToCurrentTime = function(labels) {
	return setToCurrentTime.call(this, labels)();
};

/**
 * Start a timer
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @returns {function} - Invoke this function to set the duration in seconds since you started the timer.
 * @example
 * var done = gauge.startTimer();
 * makeXHRRequest(function(err, response) {
 *	done(); //Duration of the request will be saved
 * });
 */
Gauge.prototype.startTimer = function(labels) {
	return startTimer.call(this, labels)();
};

Gauge.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type: type,
		values: getProperties(this.hashMap)
	};
};

Gauge.prototype._getValue = function(labels) {
	var hash = hashObject(labels || {});
	return this.hashMap[hash] ? this.hashMap[hash].value : 0;
};

Gauge.prototype.labels = function() {
	var labels = getLabels(this.labelNames, arguments);
	return {
		inc: inc.call(this, labels),
		dec: dec.call(this, labels),
		set: set.call(this, labels),
		setToCurrentTime: setToCurrentTime.call(this, labels),
		startTimer: startTimer.call(this, labels)
	};
};

function setToCurrentTime(labels) {
	var gauge = this;
	return function() {
		gauge.set(labels, new Date().getTime());
	};
}

function startTimer(startLabels) {
	var gauge = this;
	return function() {
		var start = new Date();
		return function(endLabels) {
			var end = new Date();
			gauge.set(extend(startLabels || {}, endLabels), (end - start) / 1000);
		};
	};
}

function dec(labels) {
	var gauge = this;
	return function(value) {
		var data = convertLabelsAndValues(labels, value);
		gauge.set(data.labels, gauge._getValue(data.labels) - (data.value || 1));
	};
}

function inc(labels) {
	var gauge = this;
	return function(value) {
		var data = convertLabelsAndValues(labels, value);
		gauge.set(data.labels, gauge._getValue(data.labels) + (data.value || 1));
	};
}

function set(labels) {
	var that = this;
	return function(value) {
		if(!isNumber(value)) {
			throw new Error('Value is not a valid number', value);
		}

		labels = labels || {};

		validateLabels(that.labelNames, labels);
		that.hashMap = createValue(that.hashMap, value, labels);
	};
}

function convertLabelsAndValues(labels, value) {
	if(isNumber(labels)) {
		return {
			value: labels,
			labels: {}
		};
	}
	return {
		labels: labels,
		value: value
	};
}


module.exports = Gauge;

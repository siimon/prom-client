/**
 * Gauge metric
 */
'use strict';

var globalRegistry = require('./register');
var type = 'gauge';

var isNumber = require('./util').isNumber;
var isDate = require('./util').isDate;
var extend = require('util-extend');
var createValue = require('./util').setValue;
var getProperties = require('./util').getPropertiesFromObj;
var getLabels = require('./util').getLabels;
var hashObject = require('./util').hashObject;
var validateMetricName = require('./validation').validateMetricName;
var validateLabels = require('./validation').validateLabel;
var validateLabelNames = require('./validation').validateLabelName;
var isObject = require('./util').isObject;
var extend = require('util-extend');

/**
 * Gauge constructor
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {Array.<string>} labels - Array with strings, all label keywords supported
 * @constructor
 */
function Gauge(name, help, labels) {
	var config;
	if(isObject(name)) {
		config = extend({
			labelNames: [],
			registers: [ globalRegistry ],
		}, name);
	} else {
		config = {
			name: name,
			help: help,
			labelNames: labels,
			registers: [ globalRegistry ]
		};
	}

	if(!config.help) {
		throw new Error('Missing mandatory help parameter');
	}
	if(!config.name) {
		throw new Error('Missing mandatory name parameter');
	}
	if(!validateMetricName(config.name)) {
		throw new Error('Invalid metric name');
	}
	if(!validateLabelNames(config.labelNames)) {
		throw new Error('Invalid label name');
	}

	this.name = config.name;
	this.labelNames = config.labelNames || [];
	this.hashMap = {};
	this.help = config.help;

	var metric = this;
	config.registers.forEach(function(registryInstance) {
		registryInstance.registerMetric(metric);
	});
}

/**
 * Set a gauge to a value
 * @param {object} labels - Object with labels and their values
 * @param {Number} value - Value to set the gauge to, must be positive
 * @param {(Number|Date)} timestamp - Timestamp to set the gauge to
 * @returns {void}
 */
Gauge.prototype.set = function(labels, value, timestamp) {
	if(isNumber(labels)) {
		return set.call(this, null)(labels, value);
	}
	return set.call(this, labels)(value, timestamp);
};

/**
 * Increment a gauge value
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to increment - if omitted, increment with 1
 * @param {(Number|Date)} timestamp - Timestamp to set the gauge to
 * @returns {void}
 */
Gauge.prototype.inc = function(labels, value, timestamp) {
	inc.call(this, labels)(value, timestamp);
};


/**
 * Decrement a gauge value
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to decrement - if omitted, decrement with 1
 * @param {(Number|Date)} timestamp - Timestamp to set the gauge to
 * @returns {void}
 */
Gauge.prototype.dec = function(labels, value, timestamp) {
	dec.call(this, labels)(value, timestamp);
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
		var start = process.hrtime();
		return function(endLabels) {
			var delta = process.hrtime(start);
			gauge.set(extend(startLabels || {}, endLabels), delta[0] + delta[1] / 1e9);
		};
	};
}

function dec(labels) {
	var gauge = this;
	return function(value, timestamp) {
		var data = convertLabelsAndValues(labels, value);
		gauge.set(data.labels, gauge._getValue(data.labels) - (data.value || 1), timestamp);
	};
}

function inc(labels) {
	var gauge = this;
	return function(value, timestamp) {
		var data = convertLabelsAndValues(labels, value);
		gauge.set(data.labels, gauge._getValue(data.labels) + (data.value || 1), timestamp);
	};
}

function set(labels) {
	var that = this;
	return function(value, timestamp) {
		if(!isNumber(value)) {
			throw new Error('Value is not a valid number', value);
		}
		if(timestamp && !isDate(timestamp) && !isNumber(timestamp)) {
			throw new Error('Timestamp is not a valid date or number', value);
		}

		labels = labels || {};

		validateLabels(that.labelNames, labels);
		that.hashMap = createValue(that.hashMap, value, labels, timestamp);
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

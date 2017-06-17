/**
 * Gauge metric
 */
'use strict';

const globalRegistry = require('./register');
const type = 'gauge';

const isNumber = require('./util').isNumber;
const isDate = require('./util').isDate;
const extend = require('util-extend');
const createValue = require('./util').setValue;
const getProperties = require('./util').getPropertiesFromObj;
const getLabels = require('./util').getLabels;
const hashObject = require('./util').hashObject;
const validateMetricName = require('./validation').validateMetricName;
const validateLabels = require('./validation').validateLabel;
const validateLabelNames = require('./validation').validateLabelName;
const isObject = require('./util').isObject;

/**
 * Gauge constructor
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {Array.<string>} labels - Array with strings, all label keywords supported
 * @constructor
 */
function Gauge(name, help, labels) {
	let config;
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

	config.registers.forEach((registryInstance) => {
		registryInstance.registerMetric(this);
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
	const hash = hashObject(labels || {});
	return this.hashMap[hash] ? this.hashMap[hash].value : 0;
};

Gauge.prototype.labels = function() {
	const labels = getLabels(this.labelNames, arguments);
	return {
		inc: inc.call(this, labels),
		dec: dec.call(this, labels),
		set: set.call(this, labels),
		setToCurrentTime: setToCurrentTime.call(this, labels),
		startTimer: startTimer.call(this, labels)
	};
};

function setToCurrentTime(labels) {
	return () => {
		this.set(labels, new Date().getTime());
	};
}

function startTimer(startLabels) {
	return () => {
		const start = process.hrtime();
		return (endLabels) => {
			const delta = process.hrtime(start);
			this.set(extend(startLabels || {}, endLabels), delta[0] + delta[1] / 1e9);
		};
	};
}

function dec(labels) {
	return (value, timestamp) => {
		const data = convertLabelsAndValues(labels, value);
		this.set(data.labels, this._getValue(data.labels) - (data.value || 1), timestamp);
	};
}

function inc(labels) {
	return (value, timestamp) => {
		const data = convertLabelsAndValues(labels, value);
		this.set(data.labels, this._getValue(data.labels) + (data.value || 1), timestamp);
	};
}

function set(labels) {
	return (value, timestamp) => {
		if(!isNumber(value)) {
			throw new Error('Value is not a valid number', value);
		}
		if(timestamp && !isDate(timestamp) && !isNumber(timestamp)) {
			throw new Error('Timestamp is not a valid date or number', value);
		}

		labels = labels || {};

		validateLabels(this.labelNames, labels);
		this.hashMap = createValue(this.hashMap, value, labels, timestamp);
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

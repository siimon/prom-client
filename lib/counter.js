/**
 * Counter metric
 */
'use strict';
var globalRegistry = require('./register');
var type = 'counter';
var isNumber = require('./util').isNumber;
var isDate = require('./util').isDate;
var getProperties = require('./util').getPropertiesFromObj;
var hashObject = require('./util').hashObject;
var validateLabels = require('./validation').validateLabel;
var validateMetricName = require('./validation').validateMetricName;
var validateLabelNames = require('./validation').validateLabelName;
var isObject = require('./util').isObject;
var extend = require('util-extend');

var getLabels = require('./util').getLabels;

/**
 * Counter
 * @param {string} name - Name of the metric
 * @param {string} help - Help description for the metric
 * @param {Array.<string>} labels - Labels
 * @constructor
 */
function Counter(name, help, labels) {
	var config;
	if(isObject(name)) {
		config = extend({
			labelNames: [],
			registers: [ globalRegistry ]
		}, name);
	} else {
		//Backwards compability - will be depricated
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

	this.name = name;
	this.name = config.name;
	this.hashMap = {};

	this.labelNames = (config.labelNames || []);

	this.help = config.help;

	var metric = this;
	config.registers.forEach(function(registryInstance) {
		registryInstance.registerMetric(metric);
	});
}

/**
 * Increment counter
 * @param {object} labels - What label you want to be incremented
 * @param {Number} value - Value to increment, if omitted increment with 1
 * @param {(Number|Date)} timestamp - Timestamp to set the counter to
 * @returns {void}
 */
Counter.prototype.inc = function(labels, value, timestamp) {
	if(isNumber(labels) || !labels) {
		return inc.call(this, null)(labels, value);
	}

	var hash = hashObject(labels);
	return inc.call(this, labels, hash)(value, timestamp);
};

Counter.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type: type,
		values: getProperties(this.hashMap)
	};
};

Counter.prototype.labels = function() {
	var labels = getLabels(this.labelNames, arguments) || {};
	var hash = hashObject(labels);
	validateLabels(this.labelNames, labels);
	return {
		inc: inc.call(this, labels, hash)
	};
};

var inc = function(labels, hash) {
	var that = this;
	return function(value, timestamp) {
		if(value && !isNumber(value)) {
			throw new Error('Value is not a valid number', value);
		}
		if(timestamp && !isDate(timestamp) && !isNumber(timestamp)) {
			throw new Error('Timestamp is not a valid date or number', value);
		}
		if(value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		var incValue = value === null || value === undefined ? 1 : value;

		that.hashMap = createValue(that.hashMap, incValue, timestamp, labels, hash);
	};
};

function createValue(hashMap, value, timestamp, labels, hash) {
	timestamp = isDate(timestamp) ? timestamp.valueOf() : isNumber(timestamp) ? timestamp : undefined;
	if(hashMap[hash]) {
		hashMap[hash].value += value;
		hashMap[hash].timestamp = timestamp;
	} else {
		hashMap[hash] = { value: value, labels: labels || {}, timestamp: timestamp };
	}
	return hashMap;
};

module.exports = Counter;

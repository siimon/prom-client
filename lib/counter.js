/**
 * Counter metric
 */
'use strict';
var register = require('./register');
var type = 'counter';
var isNumber = require('./util').isNumber;
var getProperties = require('./util').getPropertiesFromObj;
var createValue = require('./util').incValue;
var validateLabels = require('./validation').validateLabel;
var validateMetricName = require('./validation').validateMetricName;
var validateLabelNames = require('./validation').validateLabelName;

var getLabels = require('./util').getLabels;

/**
 * Counter
 * @param {string} name - Name of the metric
 * @param {string} help - Help description for the metric
 * @param {array} labels - Labels
 * @constructor
 */
function Counter(name, help, labels) {
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
	this.hashMap = {};

	this.labelNames = (labels || []);

	this.help = help;
	register.registerMetric(this);
}

/**
 * Increment counter
 * @param {object} labels - What label you want to be incremented
 * @param {float} value - Value to increment, if omitted increment with 1
 * @returns {void}
 */
Counter.prototype.inc = function(labels, value) {
	if(isNumber(labels)) {
		return inc.call(this, null)(labels);
	}
	return inc.call(this, labels)(value);
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
	var labels = getLabels(this.labelNames, arguments);

	return {
		inc: inc.call(this, labels)
	};
};

var inc = function(labels) {
	var that = this;
	return function(value) {
		if(value && !isNumber(value)) {
			throw new Error('Value is not a valid number', value);
		}
		if(value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}
		labels = labels || {};

		validateLabels(that.labelNames, labels);
		that.hashMap = createValue(that.hashMap, value || 1, labels);
	};
};

module.exports = Counter;

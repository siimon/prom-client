/**
 * Summary
 */
'use strict';

var register = require('./register');
var type = 'summary';
var isNumber = require('./util').isNumber;
var extend = require('util-extend');
var getProperties = require('./util').getPropertiesFromObj;
var getLabels = require('./util').getLabels;
var hashObject = require('./util').hashObject;
var createValue = require('./util');
var validateLabels = require('./validation').validateLabel;
var validateMetricName = require('./validation').validateMetricName;
var validateLabelNames = require('./validation').validateLabelName;
var TDigest = require('tdigest').TDigest;

/**
 * Summary
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {object|array} labelsOrConf - Either array of label names or config object as a key-value object
 * @param {object} conf - Configuration object
 * @constructor
 */
function Summary(name, help, labelsOrConf, conf) {
	var obj;
	var labels = [];

	if(Array.isArray(labelsOrConf)) {
		obj = conf || {};
		labels = labelsOrConf;
	} else {
		obj = labelsOrConf || {};
	}

	validateInput(name, help, labels);

	this.name = name;
	this.help = help;

	this.percentiles = configurePercentiles(obj.percentiles);
	this.hashMap = {};
	this.labelNames = labels || [];
	register.registerMetric(this);
}

/**
 * Observe a value
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to observe
 * @returns {void}
 */
Summary.prototype.observe = function(labels, value) {
	observe.call(this, labels === 0 ? 0 : (labels || {}))(value);
};

Summary.prototype.get = function() {
	var summary = this;
	var data = getProperties(summary.hashMap);
	var values = [];
	data.forEach(function(s) {
		extractSummariesForExport(s, summary.percentiles).forEach(function(v) {
			values.push(v);
		});
		values.push(getSumForExport(s, summary));
		values.push(getCountForExport(s, summary));
	});

	return {
		name: this.name,
		help: this.help,
		type: type,
		values: values
	};
};

Summary.prototype.reset = function() {
	var data = getProperties(this.hashMap);
	data.forEach(function(s) {
		s.td.reset();
		s.count = 0;
		s.sum = 0;
	});
};

function extractSummariesForExport(summaryOfLabels, percentiles) {
	summaryOfLabels.td.compress();

	return percentiles.map(function(percentile) {
		var percentileValue = summaryOfLabels.td.percentile(percentile);
		return {
			labels: extend({ quantile: percentile }, summaryOfLabels.labels),
			value: percentileValue ? percentileValue : 0
		};
	});
}

function getCountForExport(value, summary) {
	return {
		metricName: summary.name + '_count',
		labels: value.labels,
		value: value.count
	};
}

function getSumForExport(value, summary) {
	return {
		metricName: summary.name + '_sum',
		labels: value.labels,
		value: value.sum
	};
}


/**
 * Start a timer that could be used to logging durations
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @returns {function} - Function to invoke when you want to stop the timer and observe the duration in seconds
 * @example
 * var end = summary.startTimer();
 * makeExpensiveXHRRequest(function(err, res) {
 *	end(); //Observe the duration of expensiveXHRRequest
 * });
 */
Summary.prototype.startTimer = function(labels) {
	return startTimer.call(this, labels)();
};

Summary.prototype.labels = function() {
	var labels = getLabels(this.labelNames, arguments);
	return {
		observe: observe.call(this, labels),
		startTimer: startTimer.call(this, labels)
	};
};

function startTimer(startLabels) {
	var summary = this;
	return function() {
		var start = new Date();
		return function(endLabels) {
			var end = new Date();
			summary.observe(extend(startLabels || {}, endLabels), (end - start) / 1000);
		};
	};
}

function validateInput(name, help, labels) {
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

	labels.forEach(function(label) {
		if(label === 'quantile') {
			throw new Error('quantile is a reserved label keyword');
		}
	});
}

function configurePercentiles(configuredPercentiles) {
	var defaultPercentiles = [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999];
	return [].concat((configuredPercentiles || defaultPercentiles)).sort(sortAscending);
}

function sortAscending(x, y) {
	return x - y;
}

function createValuePair(labels, value, metricName) {
	return {
		labels: labels,
		value: value,
		metricName: metricName
	};
}

function findBound(upperBounds, value) {
	for(var i = 0; i < upperBounds.length; i++) {
		var bound = upperBounds[i];
		if(value <= bound) {
			return bound;
		}

	}
	return -1;
}

function observe(labels) {
	var summary = this;
	return function(value) {
		var labelValuePair = convertLabelsAndValues(labels, value);

		validateLabels(summary.labelNames, summary.labels);
		if(!isNumber(labelValuePair.value)) {
			throw new Error('Value is not a valid number', labelValuePair.value);
		}

		var hash = hashObject(labelValuePair.labels);
		var summaryOfLabel = summary.hashMap[hash];
		if(!summaryOfLabel) {
			summaryOfLabel = {
				labels: labelValuePair.labels,
				td: new TDigest(),
				count: 0,
				sum: 0
			};
		}

		summaryOfLabel.td.push(labelValuePair.value);
		summaryOfLabel.count++;
		summaryOfLabel.sum += labelValuePair.value;
		summary.hashMap[hash] = summaryOfLabel;
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

module.exports = Summary;

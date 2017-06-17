/**
 * Summary
 */
'use strict';

const globalRegistry = require('./register');
const type = 'summary';
const isNumber = require('./util').isNumber;
const extend = require('util-extend');
const getProperties = require('./util').getPropertiesFromObj;
const getLabels = require('./util').getLabels;
const hashObject = require('./util').hashObject;
const validateLabels = require('./validation').validateLabel;
const validateMetricName = require('./validation').validateMetricName;
const validateLabelNames = require('./validation').validateLabelName;
const TDigest = require('tdigest').TDigest;
const isObject = require('util').isObject;

/**
 * Summary
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {object|Array.<string>} labelsOrConf - Either array of label names or config object as a key-value object
 * @param {object} conf - Configuration object
 * @constructor
 */
function Summary(name, help, labelsOrConf, conf) {
	let config;
	if(isObject(name)) {
		config = extend({
			percentiles: [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999],
			labelNames: [],
			registers: [ globalRegistry ],
		}, name);
	} else {
		let obj;
		let labels = [];

		if(Array.isArray(labelsOrConf)) {
			obj = conf || {};
			labels = labelsOrConf;
		} else {
			obj = labelsOrConf || {};
		}

		config = {
			name: name,
			help: help,
			labelNames: labels,
			percentiles: configurePercentiles(obj.percentiles),
			registers: [ globalRegistry ]
		};
	}

	validateInput(config.name, config.help, config.labelNames);

	this.name = config.name;
	this.help = config.help;

	this.percentiles = config.percentiles;
	this.hashMap = {};
	this.labelNames = config.labelNames || [];

	const metric = this;
	config.registers.forEach(function(registryInstance) {
		registryInstance.registerMetric(metric);
	});
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
	const summary = this;
	const data = getProperties(summary.hashMap);
	const values = [];
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
	const data = getProperties(this.hashMap);
	data.forEach(function(s) {
		s.td.reset();
		s.count = 0;
		s.sum = 0;
	});
};

function extractSummariesForExport(summaryOfLabels, percentiles) {
	summaryOfLabels.td.compress();

	return percentiles.map(function(percentile) {
		const percentileValue = summaryOfLabels.td.percentile(percentile);
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
	const labels = getLabels(this.labelNames, arguments);
	return {
		observe: observe.call(this, labels),
		startTimer: startTimer.call(this, labels)
	};
};

function startTimer(startLabels) {
	const summary = this;
	return function() {
		const start = process.hrtime();
		return function(endLabels) {
			const delta = process.hrtime(start);
			summary.observe(extend(startLabels || {}, endLabels),  delta[0] + delta[1] / 1e9);
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
	const defaultPercentiles = [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999];
	return [].concat((configuredPercentiles || defaultPercentiles)).sort(sortAscending);
}

function sortAscending(x, y) {
	return x - y;
}

function observe(labels) {
	const summary = this;
	return function(value) {
		const labelValuePair = convertLabelsAndValues(labels, value);

		validateLabels(summary.labelNames, summary.labels);
		if(!isNumber(labelValuePair.value)) {
			throw new Error('Value is not a valid number', labelValuePair.value);
		}

		const hash = hashObject(labelValuePair.labels);
		let summaryOfLabel = summary.hashMap[hash];
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

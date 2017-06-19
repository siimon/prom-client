/**
 * Summary
 */
'use strict';

const globalRegistry = require('./register');
const type = 'summary';
const isNumber = require('./util').isNumber;
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
	if (isObject(name)) {
		config = Object.assign(
			{
				percentiles: [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999],
				labelNames: [],
				registers: [globalRegistry]
			},
			name
		);
	} else {
		let obj;
		let labels = [];

		if (Array.isArray(labelsOrConf)) {
			obj = conf || {};
			labels = labelsOrConf;
		} else {
			obj = labelsOrConf || {};
		}

		config = {
			name,
			help,
			labelNames: labels,
			percentiles: configurePercentiles(obj.percentiles),
			registers: [globalRegistry]
		};
	}

	validateInput(config.name, config.help, config.labelNames);

	this.name = config.name;
	this.help = config.help;

	this.percentiles = config.percentiles;
	this.hashMap = {};
	this.labelNames = config.labelNames || [];

	config.registers.forEach(registryInstance => {
		registryInstance.registerMetric(this);
	});
}

/**
 * Observe a value
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to observe
 * @returns {void}
 */
Summary.prototype.observe = function(labels, value) {
	observe.call(this, labels === 0 ? 0 : labels || {})(value);
};

Summary.prototype.get = function() {
	const data = getProperties(this.hashMap);
	const values = [];
	data.forEach(s => {
		extractSummariesForExport(s, this.percentiles).forEach(v => {
			values.push(v);
		});
		values.push(getSumForExport(s, this));
		values.push(getCountForExport(s, this));
	});

	return {
		name: this.name,
		help: this.help,
		type,
		values
	};
};

Summary.prototype.reset = function() {
	const data = getProperties(this.hashMap);
	data.forEach(s => {
		s.td.reset();
		s.count = 0;
		s.sum = 0;
	});
};

function extractSummariesForExport(summaryOfLabels, percentiles) {
	summaryOfLabels.td.compress();

	return percentiles.map(percentile => {
		const percentileValue = summaryOfLabels.td.percentile(percentile);
		return {
			labels: Object.assign({ quantile: percentile }, summaryOfLabels.labels),
			value: percentileValue ? percentileValue : 0
		};
	});
}

function getCountForExport(value, summary) {
	return {
		metricName: `${summary.name}_count`,
		labels: value.labels,
		value: value.count
	};
}

function getSumForExport(value, summary) {
	return {
		metricName: `${summary.name}_sum`,
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
	return () => {
		const start = process.hrtime();
		return endLabels => {
			const delta = process.hrtime(start);
			this.observe(
				Object.assign(startLabels || {}, endLabels),
				delta[0] + delta[1] / 1e9
			);
		};
	};
}

function validateInput(name, help, labels) {
	if (!help) {
		throw new Error('Missing mandatory help parameter');
	}
	if (!name) {
		throw new Error('Missing mandatory name parameter');
	}

	if (!validateMetricName(name)) {
		throw new Error('Invalid metric name');
	}

	if (!validateLabelNames(labels)) {
		throw new Error('Invalid label name');
	}

	labels.forEach(label => {
		if (label === 'quantile') {
			throw new Error('quantile is a reserved label keyword');
		}
	});
}

function configurePercentiles(configuredPercentiles) {
	const defaultPercentiles = [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999];
	return []
		.concat(configuredPercentiles || defaultPercentiles)
		.sort(sortAscending);
}

function sortAscending(x, y) {
	return x - y;
}

function observe(labels) {
	return value => {
		const labelValuePair = convertLabelsAndValues(labels, value);

		validateLabels(this.labelNames, this.labels);
		if (!isNumber(labelValuePair.value)) {
			throw new Error('Value is not a valid number', labelValuePair.value);
		}

		const hash = hashObject(labelValuePair.labels);
		let summaryOfLabel = this.hashMap[hash];
		if (!summaryOfLabel) {
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
		this.hashMap[hash] = summaryOfLabel;
	};
}

function convertLabelsAndValues(labels, value) {
	if (isNumber(labels)) {
		return {
			value: labels,
			labels: {}
		};
	}
	return {
		labels,
		value
	};
}

module.exports = Summary;

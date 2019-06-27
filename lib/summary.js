/**
 * Summary
 */
'use strict';

const util = require('util');
const { globalRegistry } = require('./registry');
const type = 'summary';
const {
	getPropertiesFromObj,
	getLabels,
	hashObject,
	isObject,
	printDeprecationObjectConstructor,
	removeLabels
} = require('./util');
const {
	validateLabel,
	validateMetricName,
	validateLabelName
} = require('./validation');
const timeWindowQuantiles = require('./timeWindowQuantiles');

const DEFAULT_COMPRESS_COUNT = 1000; // every 1000 measurements

class Summary {
	/**
	 * Summary
	 * @param {string} name - Name of the metric
	 * @param {string} help - Help for the metric
	 * @param {object|Array.<string>} labelsOrConf - Either array of label names or config object as a key-value object
	 * @param {object} conf - Configuration object
	 */
	constructor(name, help, labelsOrConf, conf) {
		let config;
		if (isObject(name)) {
			config = Object.assign(
				{
					percentiles: [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999],
					labelNames: []
				},
				name
			);

			if (!config.registers) {
				config.registers = [globalRegistry];
			}
		} else {
			let obj;
			let labels = [];

			if (Array.isArray(labelsOrConf)) {
				obj = conf || {};
				labels = labelsOrConf;
			} else {
				obj = labelsOrConf || {};
			}

			printDeprecationObjectConstructor();

			config = {
				name,
				help,
				labelNames: labels,
				percentiles: configurePercentiles(obj.percentiles),
				registers: [globalRegistry],
				maxAgeSeconds: obj.maxAgeSeconds,
				ageBuckets: obj.ageBuckets
			};
		}

		validateInput(config.name, config.help, config.labelNames);

		this.maxAgeSeconds = config.maxAgeSeconds;
		this.ageBuckets = config.ageBuckets;

		this.name = config.name;
		this.help = config.help;
		this.aggregator = config.aggregator || 'sum';

		this.percentiles = config.percentiles;
		this.hashMap = {};
		this.labelNames = config.labelNames || [];

		this.compressCount = config.compressCount || DEFAULT_COMPRESS_COUNT;

		if (this.labelNames.length === 0) {
			this.hashMap = {
				[hashObject({})]: {
					labels: {},
					td: new timeWindowQuantiles(this.maxAgeSeconds, this.ageBuckets),
					count: 0,
					sum: 0
				}
			};
		}

		config.registers.forEach(registryInstance =>
			registryInstance.registerMetric(this)
		);
	}

	/**
	 * Observe a value
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @param {Number} value - Value to observe
	 * @returns {void}
	 */
	observe(labels, value) {
		observe.call(this, labels === 0 ? 0 : labels || {})(value);
	}

	get() {
		const data = getPropertiesFromObj(this.hashMap);
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
			values,
			aggregator: this.aggregator
		};
	}

	reset() {
		const data = getPropertiesFromObj(this.hashMap);
		data.forEach(s => {
			s.td.reset();
			s.count = 0;
			s.sum = 0;
		});
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
	startTimer(labels) {
		return startTimer.call(this, labels)();
	}

	labels() {
		const labels = getLabels(this.labelNames, arguments);
		return {
			observe: observe.call(this, labels),
			startTimer: startTimer.call(this, labels)
		};
	}

	remove() {
		const labels = getLabels(this.labelNames, arguments);
		removeLabels.call(this, this.hashMap, labels);
	}
}

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

function startTimer(startLabels) {
	return () => {
		const start = process.hrtime();
		return endLabels => {
			const delta = process.hrtime(start);
			this.observe(
				Object.assign({}, startLabels, endLabels),
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

	if (!validateLabelName(labels)) {
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

		validateLabel(this.labelNames, this.labels);
		if (!Number.isFinite(labelValuePair.value)) {
			throw new TypeError(
				`Value is not a valid number: ${util.format(labelValuePair.value)}`
			);
		}

		const hash = hashObject(labelValuePair.labels);
		let summaryOfLabel = this.hashMap[hash];
		if (!summaryOfLabel) {
			summaryOfLabel = {
				labels: labelValuePair.labels,
				td: new timeWindowQuantiles(this.maxAgeSeconds, this.ageBuckets),
				count: 0,
				sum: 0
			};
		}

		summaryOfLabel.td.push(labelValuePair.value);
		summaryOfLabel.count++;
		if (summaryOfLabel.count % this.compressCount === 0) {
			summaryOfLabel.td.compress();
		}
		summaryOfLabel.sum += labelValuePair.value;
		this.hashMap[hash] = summaryOfLabel;
	};
}

function convertLabelsAndValues(labels, value) {
	if (value === undefined) {
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

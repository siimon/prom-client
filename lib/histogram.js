/**
 * Histogram
 */
'use strict';

const util = require('util');
const globalRegistry = require('./registry').globalRegistry;
const type = 'histogram';
const getProperties = require('./util').getPropertiesFromObj;
const getLabels = require('./util').getLabels;
const hashObject = require('./util').hashObject;
const validateLabels = require('./validation').validateLabel;
const validateMetricName = require('./validation').validateMetricName;
const validateLabelNames = require('./validation').validateLabelName;
const isObject = require('./util').isObject;
const printDeprecationObjectConstructor = require('./util')
	.printDeprecationObjectConstructor;

class Histogram {
	/**
	 * Histogram
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
					buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
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
				labelNames: labels,
				help,
				buckets: configureUpperbounds(obj.buckets),
				registers: [globalRegistry]
			};
		}
		validateInput(config.name, config.help, config.labelNames);

		this.name = config.name;
		this.help = config.help;
		this.aggregator = config.aggregator || 'sum';

		this.upperBounds = config.buckets;
		this.bucketValues = this.upperBounds.reduce((acc, upperBound) => {
			acc[upperBound] = 0;
			return acc;
		}, {});

		Object.freeze(this.bucketValues);
		Object.freeze(this.upperBounds);
		this.sum = 0;
		this.count = 0;

		this.hashMap = {};
		this.labelNames = config.labelNames || [];

		if (this.labelNames.length === 0) {
			this.hashMap = {
				[hashObject({})]: createBaseValues(
					{},
					Object.assign({}, this.bucketValues)
				)
			};
		}

		config.registers.forEach(registryInstance =>
			registryInstance.registerMetric(this)
		);
	}

	/**
	 * Observe a value in histogram
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @param {Number} value - Value to observe in the histogram
	 * @returns {void}
	 */
	observe(labels, value) {
		observe.call(this, labels === 0 ? 0 : labels || {})(value);
	}

	get() {
		const data = getProperties(this.hashMap);
		const values = data
			.map(extractBucketValuesForExport(this))
			.reduce(addSumAndCountForExport(this), []);

		return {
			name: this.name,
			help: this.help,
			type,
			values,
			aggregator: this.aggregator
		};
	}

	reset() {
		this.sum = 0;
		this.count = 0;
		this.hashMap = {};
	}

	/**
	 * Start a timer that could be used to logging durations
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @returns {function} - Function to invoke when you want to stop the timer and observe the duration in seconds
	 * @example
	 * var end = histogram.startTimer();
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
}

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
		if (label === 'le') {
			throw new Error('le is a reserved label keyword');
		}
	});
}

function configureUpperbounds(configuredBuckets) {
	const defaultBuckets = [
		0.005,
		0.01,
		0.025,
		0.05,
		0.1,
		0.25,
		0.5,
		1,
		2.5,
		5,
		10
	];
	return [].concat(configuredBuckets || defaultBuckets).sort(sortAscending);
}

function sortAscending(x, y) {
	return x - y;
}

function createValuePair(labels, value, metricName) {
	return {
		labels,
		value,
		metricName
	};
}

function findBound(upperBounds, value) {
	for (let i = 0; i < upperBounds.length; i++) {
		const bound = upperBounds[i];
		if (value <= bound) {
			return bound;
		}
	}
	return -1;
}

function observe(labels) {
	return value => {
		const labelValuePair = convertLabelsAndValues(labels, value);

		validateLabels(this.labelNames, labelValuePair.labels);
		if (!Number.isFinite(labelValuePair.value)) {
			throw new TypeError(
				`Value is not a valid number: ${util.format(labelValuePair.value)}`
			);
		}

		const hash = hashObject(labelValuePair.labels);
		let valueFromMap = this.hashMap[hash];
		if (!valueFromMap) {
			valueFromMap = createBaseValues(
				labelValuePair.labels,
				Object.assign({}, this.bucketValues)
			);
		}

		const b = findBound(this.upperBounds, labelValuePair.value);

		valueFromMap.sum += labelValuePair.value;
		valueFromMap.count += 1;

		if (valueFromMap.bucketValues.hasOwnProperty(b)) {
			valueFromMap.bucketValues[b] += 1;
		}

		this.hashMap[hash] = valueFromMap;
	};
}

function createBaseValues(labels, bucketValues) {
	return {
		labels,
		bucketValues,
		sum: 0,
		count: 0
	};
}

function convertLabelsAndValues(labels, value) {
	if (!isObject(labels)) {
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

function extractBucketValuesForExport(histogram) {
	return bucketData => {
		const buckets = histogram.upperBounds.map(
			createBucketValues(bucketData, histogram)
		);
		return { buckets, data: bucketData };
	};
}

function addSumAndCountForExport(histogram) {
	return (acc, d) => {
		acc = acc.concat(d.buckets);

		const infLabel = Object.assign({ le: '+Inf' }, d.data.labels);
		acc.push(
			createValuePair(infLabel, d.data.count, `${histogram.name}_bucket`)
		);
		acc.push(
			createValuePair(d.data.labels, d.data.sum, `${histogram.name}_sum`)
		);
		acc.push(
			createValuePair(d.data.labels, d.data.count, `${histogram.name}_count`)
		);
		return acc;
	};
}

function createBucketValues(bucket, histogram) {
	let acc = 0;
	return upperBound => {
		acc += bucket.bucketValues[upperBound];
		const lbls = Object.assign({ le: upperBound }, bucket.labels);
		const valuePair = createValuePair(lbls, acc, `${histogram.name}_bucket`);
		return valuePair;
	};
}

module.exports = Histogram;

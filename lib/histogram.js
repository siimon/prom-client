/**
 * Histogram
 */
'use strict';

const util = require('util');
const type = 'histogram';
const { getLabels, hashObject, isObject, removeLabels } = require('./util');
const { validateLabel } = require('./validation');
const { Metric } = require('./metric');

class Histogram extends Metric {
	constructor(config) {
		super(config, {
			buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
		});

		for (const label of this.labelNames) {
			if (label === 'le') {
				throw new Error('le is a reserved label keyword');
			}
		}

		this.upperBounds = this.buckets;
		this.bucketValues = this.upperBounds.reduce((acc, upperBound) => {
			acc[upperBound] = 0;
			return acc;
		}, {});

		Object.freeze(this.bucketValues);
		Object.freeze(this.upperBounds);

		if (this.labelNames.length === 0) {
			this.hashMap = {
				[hashObject({})]: createBaseValues(
					{},
					Object.assign({}, this.bucketValues),
				),
			};
		}
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
		const data = Object.values(this.hashMap);
		const values = data
			.map(extractBucketValuesForExport(this))
			.reduce(addSumAndCountForExport(this), []);

		return {
			name: this.name,
			help: this.help,
			type,
			values,
			aggregator: this.aggregator,
		};
	}

	reset() {
		this.hashMap = {};
	}

	/**
	 * Start a timer that could be used to logging durations
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @returns {function} - Function to invoke when you want to stop the timer and observe the duration in seconds
	 * @example
	 * var end = histogram.startTimer();
	 * makeExpensiveXHRRequest(function(err, res) {
	 * 	const duration = end(); //Observe the duration of expensiveXHRRequest and returns duration in seconds
	 * 	console.log('Duration', duration);
	 * });
	 */
	startTimer(labels) {
		return startTimer.call(this, labels)();
	}

	labels() {
		const labels = getLabels(this.labelNames, arguments);
		return {
			observe: observe.call(this, labels),
			startTimer: startTimer.call(this, labels),
		};
	}

	remove() {
		const labels = getLabels(this.labelNames, arguments);
		removeLabels.call(this, this.hashMap, labels);
	}
}

function startTimer(startLabels) {
	return () => {
		const start = process.hrtime();
		return endLabels => {
			const delta = process.hrtime(start);
			const value = delta[0] + delta[1] / 1e9;
			this.observe(Object.assign({}, startLabels, endLabels), value);
			return value;
		};
	};
}

function setValuePair(labels, value, metricName) {
	return {
		labels,
		value,
		metricName,
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

		validateLabel(this.labelNames, labelValuePair.labels);
		if (!Number.isFinite(labelValuePair.value)) {
			throw new TypeError(
				`Value is not a valid number: ${util.format(labelValuePair.value)}`,
			);
		}

		const hash = hashObject(labelValuePair.labels);
		let valueFromMap = this.hashMap[hash];
		if (!valueFromMap) {
			valueFromMap = createBaseValues(
				labelValuePair.labels,
				Object.assign({}, this.bucketValues),
			);
		}

		const b = findBound(this.upperBounds, labelValuePair.value);

		valueFromMap.sum += labelValuePair.value;
		valueFromMap.count += 1;

		if (Object.prototype.hasOwnProperty.call(valueFromMap.bucketValues, b)) {
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
		count: 0,
	};
}

function convertLabelsAndValues(labels, value) {
	if (!isObject(labels)) {
		return {
			value: labels,
			labels: {},
		};
	}
	return {
		labels,
		value,
	};
}

function extractBucketValuesForExport(histogram) {
	return bucketData => {
		const buckets = [];
		const bucketLabelNames = Object.keys(bucketData.labels);
		let acc = 0;
		for (const upperBound of histogram.upperBounds) {
			acc += bucketData.bucketValues[upperBound];
			const lbls = { le: upperBound };
			for (const labelName of bucketLabelNames) {
				lbls[labelName] = bucketData.labels[labelName];
			}
			buckets.push(setValuePair(lbls, acc, `${histogram.name}_bucket`));
		}
		return { buckets, data: bucketData };
	};
}

function addSumAndCountForExport(histogram) {
	return (acc, d) => {
		acc.push(...d.buckets);

		const infLabel = { le: '+Inf' };
		for (const label of Object.keys(d.data.labels)) {
			infLabel[label] = d.data.labels[label];
		}
		acc.push(
			setValuePair(infLabel, d.data.count, `${histogram.name}_bucket`),
			setValuePair(d.data.labels, d.data.sum, `${histogram.name}_sum`),
			setValuePair(d.data.labels, d.data.count, `${histogram.name}_count`),
		);
		return acc;
	};
}

module.exports = Histogram;

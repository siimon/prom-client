/**
 * Histogram
 */
'use strict';

const util = require('util');
const {
	getLabels,
	hashObject,
	isObject,
	removeLabels,
	nowTimestamp,
} = require('./util');
const { validateLabel } = require('./validation');
const { Metric } = require('./metric');
const Exemplar = require('./exemplar');

class Histogram extends Metric {
	constructor(config) {
		super(config, {
			buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
		});

		this.type = 'histogram';
		this.defaultLabels = {};
		this.defaultExemplarLabelSet = {};

		if (config.enableExemplars) {
			this.observe = this.observeWithExemplar;
		} else {
			this.observe = this.observeWithoutExemplar;
		}

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

		this.bucketExemplars = this.upperBounds.reduce((acc, upperBound) => {
			acc[upperBound] = null;
			return acc;
		}, {});

		Object.freeze(this.bucketValues);
		Object.freeze(this.bucketExemplars);
		Object.freeze(this.upperBounds);

		if (this.labelNames.length === 0) {
			this.hashMap = {
				[hashObject({})]: createBaseValues(
					{},
					this.bucketValues,
					this.bucketExemplars,
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
	observeWithoutExemplar(labels, value) {
		observe.call(this, labels === 0 ? 0 : labels || {})(value);
	}

	observeWithExemplar({
		labels = this.defaultLabels,
		value,
		exemplarLabels = this.defaultExemplarLabelSet,
	} = {}) {
		observe.call(this, labels === 0 ? 0 : labels || {})(value);
		this.updateExemplar(labels, value, exemplarLabels);
	}

	updateExemplar(labels, value, exemplarLabels) {
		const hash = hashObject(labels);
		const bound = findBound(this.upperBounds, value);
		const { bucketExemplars } = this.hashMap[hash];
		let exemplar = bucketExemplars[bound];
		if (!isObject(exemplar)) {
			exemplar = new Exemplar();
			bucketExemplars[bound] = exemplar;
		}
		exemplar.validateExemplarLabelSet(exemplarLabels);
		exemplar.labelSet = exemplarLabels;
		exemplar.value = value;
		exemplar.timestamp = nowTimestamp();
	}

	async get() {
		const data = await this.getForPromString();
		data.values = data.values.map(splayLabels);
		return data;
	}

	async getForPromString() {
		if (this.collect) {
			const v = this.collect();
			if (v instanceof Promise) await v;
		}
		const data = Object.values(this.hashMap);
		const values = data
			.map(extractBucketValuesForExport(this))
			.reduce(addSumAndCountForExport(this), []);

		return {
			name: this.name,
			help: this.help,
			type: this.type,
			values,
			aggregator: this.aggregator,
		};
	}

	reset() {
		this.hashMap = {};
	}

	/**
	 * Initialize the metrics for the given combination of labels to zero
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @returns {void}
	 */
	zero(labels) {
		const hash = hashObject(labels);
		this.hashMap[hash] = createBaseValues(
			labels,
			this.bucketValues,
			this.bucketExemplars,
		);
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

	labels(...args) {
		const labels = getLabels(this.labelNames, args);
		validateLabel(this.labelNames, labels);
		return {
			observe: observe.call(this, labels),
			startTimer: startTimer.call(this, labels),
		};
	}

	remove(...args) {
		const labels = getLabels(this.labelNames, args);
		validateLabel(this.labelNames, labels);
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

function setValuePair(labels, value, metricName, exemplar, sharedLabels = {}) {
	return {
		labels,
		sharedLabels,
		value,
		metricName,
		exemplar,
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
				this.bucketValues,
				this.bucketExemplars,
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

function createBaseValues(labels, bucketValues, bucketExemplars) {
	return {
		labels,
		bucketValues: { ...bucketValues },
		bucketExemplars: { ...bucketExemplars },
		sum: 0,
		count: 0,
	};
}

function convertLabelsAndValues(labels, value) {
	return isObject(labels)
		? {
				labels,
				value,
		  }
		: {
				value: labels,
				labels: {},
		  };
}

function extractBucketValuesForExport(histogram) {
	const name = `${histogram.name}_bucket`;
	return bucketData => {
		let acc = 0;
		const buckets = histogram.upperBounds.map(upperBound => {
			acc += bucketData.bucketValues[upperBound];
			return setValuePair(
				{ le: upperBound },
				acc,
				name,
				bucketData.bucketExemplars[upperBound],
				bucketData.labels,
			);
		});
		return { buckets, data: bucketData };
	};
}

function addSumAndCountForExport(histogram) {
	return (acc, d) => {
		acc.push(...d.buckets);

		const infLabel = { le: '+Inf' };
		acc.push(
			setValuePair(
				infLabel,
				d.data.count,
				`${histogram.name}_bucket`,
				d.data.bucketExemplars['-1'],
				d.data.labels,
			),
			setValuePair(
				{},
				d.data.sum,
				`${histogram.name}_sum`,
				undefined,
				d.data.labels,
			),
			setValuePair(
				{},
				d.data.count,
				`${histogram.name}_count`,
				undefined,
				d.data.labels,
			),
		);
		return acc;
	};
}

function splayLabels(bucket) {
	const { sharedLabels, labels, ...newBucket } = bucket;
	for (const label of Object.keys(sharedLabels)) {
		labels[label] = sharedLabels[label];
	}
	newBucket.labels = labels;
	return newBucket;
}

module.exports = Histogram;

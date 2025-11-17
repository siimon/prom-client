/**
 * Histogram
 */
'use strict';

const util = require('util');
const { getLabels, isObject, nowTimestamp, LabelMap } = require('./util');
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
		this.enableExemplars = false;

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

		if (config.enableExemplars) {
			this.enableExemplars = true;
			this.bucketExemplars = this.upperBounds.reduce((acc, upperBound) => {
				acc[upperBound] = null;
				return acc;
			}, {});
			Object.freeze(this.bucketExemplars);
			this.observe = this.observeWithExemplar;
		} else {
			this.observe = this.observeWithoutExemplar;
		}

		Object.freeze(this.bucketValues);
		Object.freeze(this.upperBounds);

		if (this.labelNames.length === 0) {
			this.store = new LabelMap(this.sortedLabelNames);
			this.store.merge(
				{},
				createBaseValues({}, this.bucketValues, this.bucketExemplars),
			);
		}

		// Assign sync or async implementations based on presence of collect function
		if (config.collect) {
			this.getForPromString = this._getForPromStringAsync;
			this.get = this._getAsync;
		} else {
			this.getForPromString = this._getForPromStringSync;
			this.get = this._getSync;
		}
	}

	/**
	 * Observe a value in histogram.
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @param {number} value - Value to observe in the histogram
	 * @returns {void}
	 */
	observeWithoutExemplar(labels, value) {
		observe(this, labels === 0 ? 0 : labels || {}, value);
	}

	observeWithExemplar({
		labels = this.defaultLabels,
		value,
		exemplarLabels = this.defaultExemplarLabelSet,
	} = {}) {
		observe(this, labels === 0 ? 0 : labels || {}, value);
		this.updateExemplar(labels, value, exemplarLabels);
	}

	updateExemplar(labels, value, exemplarLabels) {
		if (Object.keys(exemplarLabels).length === 0) return;
		const bound = findBound(this.upperBounds, value);
		const { bucketExemplars } = this.store.entry(labels);
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

	_getForPromStringSync() {
		const data = Array.from(this.store.values());
		const values = [];
		const bucketName = `${this.name}_bucket`;
		const upperBounds = this.upperBounds;

		for (let i = 0; i < data.length; i++) {
			const bucketData = data[i];
			let acc = 0;

			// Add bucket values
			for (let j = 0; j < upperBounds.length; j++) {
				const upperBound = upperBounds[j];
				acc += bucketData.bucketValues[upperBound];
				values.push(
					setValuePair(
						{ le: upperBound },
						acc,
						bucketName,
						bucketData.bucketExemplars
							? bucketData.bucketExemplars[upperBound]
							: null,
						bucketData.labels,
					),
				);
			}

			// Add +Inf, sum, and count
			const infLabel = { le: '+Inf' };
			values.push(
				setValuePair(
					infLabel,
					bucketData.count,
					bucketName,
					bucketData.bucketExemplars ? bucketData.bucketExemplars['-1'] : null,
					bucketData.labels,
				),
				setValuePair(
					{},
					bucketData.sum,
					`${this.name}_sum`,
					undefined,
					bucketData.labels,
				),
				setValuePair(
					{},
					bucketData.count,
					`${this.name}_count`,
					undefined,
					bucketData.labels,
				),
			);
		}

		return {
			name: this.name,
			help: this.help,
			type: this.type,
			values,
			aggregator: this.aggregator,
		};
	}

	_getForPromStringAsync() {
		const v = this.collect();
		if (v instanceof Promise) {
			return v.then(() => this._getForPromStringSync());
		}
		return this._getForPromStringSync();
	}

	_splayAndGet() {
		const data = this._getForPromStringSync();
		const values = data.values;
		for (let i = 0; i < values.length; i++) {
			values[i] = splayLabels(values[i]);
		}
		return data;
	}

	_getSync() {
		return this._splayAndGet();
	}

	_getAsync() {
		const v = this.collect();
		if (v instanceof Promise) {
			return v.then(() => this._splayAndGet());
		}
		return this._splayAndGet();
	}

	reset() {
		this.store = new LabelMap(this.sortedLabelNames);
	}

	/**
	 * Initialize the metrics for the given combination of labels to zero.
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @returns {void}
	 */
	zero(labels) {
		this.store.validate(labels);
		this.store.merge(
			labels,
			createBaseValues(labels, this.bucketValues, this.bucketExemplars),
		);
	}

	/**
	 * Start a timer that could be used to logging durations.
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @param {object} exemplarLabels - Object with labels for exemplar where key is the label key and value is label value. Can only be one level deep
	 * @returns {Function} - Function to invoke when you want to stop the timer and observe the duration in seconds
	 * @example
	 * var end = histogram.startTimer();
	 * makeExpensiveXHRRequest(function(err, res) {
	 * 	const duration = end(); //Observe the duration of expensiveXHRRequest and returns duration in seconds
	 * 	console.log('Duration', duration);
	 * });
	 */
	startTimer(labels, exemplarLabels) {
		return this.enableExemplars
			? startTimerWithExemplar(this, labels, exemplarLabels)
			: startTimer(this, labels);
	}

	labels(...args) {
		const labels = getLabels(this.labelNames, args);
		this.store.validate(labels);
		return {
			observe: value => observe(this, labels, value),
			startTimer: () => startTimer(this, labels),
		};
	}

	remove(...args) {
		const labels = getLabels(this.labelNames, args);
		this.store.validate(labels);
		this.store.remove(labels);
	}
}

function startTimer(histogram, startLabels) {
	const start = process.hrtime();
	return endLabels => {
		const delta = process.hrtime(start);
		const value = delta[0] + delta[1] / 1e9;
		histogram.observe(Object.assign({}, startLabels, endLabels), value);
		return value;
	};
}

function startTimerWithExemplar(histogram, startLabels, startExemplarLabels) {
	const start = process.hrtime();
	return (endLabels, endExemplarLabels) => {
		const delta = process.hrtime(start);
		const value = delta[0] + delta[1] / 1e9;
		histogram.observe({
			labels: Object.assign({}, startLabels, endLabels),
			value,
			exemplarLabels: Object.assign({}, startExemplarLabels, endExemplarLabels),
		});
		return value;
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
	let left = 0;
	let right = upperBounds.length - 1;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		if (upperBounds[mid] <= value) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}

	if (left < upperBounds.length) {
		return upperBounds[left];
	} else {
		return -1;
	}
}

/**
 * @param {Histogram} histogram
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {number} value - Value to observe in the histogram
 */
function observe(histogram, labels, value) {
	const labelValuePair = convertLabelsAndValues(labels, value);

	if (!Number.isFinite(labelValuePair.value)) {
		throw new TypeError(
			`Value is not a valid number: ${util.format(labelValuePair.value)}`,
		);
	}

	histogram.store.validate(labelValuePair.labels);
	let entry = histogram.store.entry(labelValuePair.labels);
	if (entry === undefined) {
		entry = histogram.store.merge(
			labelValuePair.labels,
			createBaseValues(
				labelValuePair.labels,
				histogram.bucketValues,
				histogram.bucketExemplars,
			),
		);
	}

	const b = findBound(histogram.upperBounds, labelValuePair.value);

	entry.sum += labelValuePair.value;
	entry.count += 1;

	if (Object.hasOwn(entry.bucketValues, b)) {
		entry.bucketValues[b] += 1;
	}
}

function createBaseValues(labels, bucketValues, bucketExemplars) {
	const result = {
		labels,
		bucketValues: { ...bucketValues },
		sum: 0,
		count: 0,
	};
	if (bucketExemplars) {
		result.bucketExemplars = { ...bucketExemplars };
	}
	return result;
}

function convertLabelsAndValues(labels, value) {
	return isObject(labels)
		? {
				labels,
				value,
			}
		: {
				labels: {},
				value: labels,
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

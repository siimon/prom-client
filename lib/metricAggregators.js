'use strict';

const { Grouper, hashObject } = require('./util');

/**
 * Returns the sum of all label values passed
 * @param {Object} v Label values
 * @return {Number} sum of values
 */
function sum(v) {
	return v.reduce((p, c) => p + c.value, 0);
}

/**
 * Returns the first label value
 * @param {Object} v Label values
 * @return {Number} first value.
 */
function first(v) {
	return v[0].value;
}

/**
 * @return {undefined} Undefined; omits the values.
 */
function omit() {}

/**
 * Returns the mean of all label values
 * @param {Object} v Label values
 * @return {Number} mean of values.
 */
function average(v) {
	return v.reduce((p, c) => p + c.value, 0) / v.length;
}

/**
 * Returns the minimum of all label values
 * @param {Object} v Label values
 * @return {Number} min of values.
 */
function min(v) {
	return v.reduce((p, c) => Math.min(p, c.value), Infinity);
}

/**
 * Returns the maximum of all label values
 * @param {Object} v Label values
 * @return {Number} max of values.
 */
function max(v) {
	return v.reduce((p, c) => Math.max(p, c.value), -Infinity);
}

/**
 * Returns a new function that applies the `aggregatorFn` to the values.
 * @param {Function} aggregatorFn function to apply to values.
 * @return {Function} aggregator function
 */
function AggregatorFactory(aggregatorFn) {
	return metrics => {
		if (metrics.length === 0) return;
		const result = {
			help: metrics[0].help,
			name: metrics[0].name,
			type: metrics[0].type,
			values: [],
			aggregator: metrics[0].aggregator,
		};
		// Gather metrics by metricName and labels.
		const byLabels = new Grouper();
		metrics.forEach(metric => {
			metric.values.forEach(value => {
				const key = hashObject(value.labels);
				byLabels.add(`${value.metricName}_${key}`, value);
			});
		});
		// Apply aggregator function to gathered metrics.
		byLabels.forEach(values => {
			if (values.length === 0) return;
			const valObj = {
				labels: values[0].labels,
			};
			if (values[0].metricName) {
				valObj.metricName = values[0].metricName;
			}
			// Should always `sum` if it's `sum` or `count` that's part of histogram & summary
			if (
				values[0].metricName === `${result.name}_sum` ||
				values[0].metricName === `${result.name}_count`
			) {
				valObj.value = sum(values);
			} else {
				valObj.value = aggregatorFn(values);
			}
			// NB: Timestamps are omitted.
			result.values.push(valObj);
		});
		return result;
	};
}
// Export for users to define their own aggregation methods.
exports.AggregatorFactory = AggregatorFactory;

/**
 * Functions that can be used to aggregate metrics from multiple registries.
 */
exports.aggregators = {
	sum: AggregatorFactory(sum),

	first: AggregatorFactory(first),

	omit,

	average: AggregatorFactory(average),
	/**
	 * @return The minimum of the values.
	 */
	min: AggregatorFactory(min),
	/**
	 * @return The maximum of the values.
	 */
	max: AggregatorFactory(max),
};

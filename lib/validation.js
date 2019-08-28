'use strict';

const util = require('util');

// These are from https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
const metricRegexp = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;
const labelRegexp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

exports.validateMetricName = function(name) {
	return metricRegexp.test(name);
};

/**
 * normalize metrics name
 * @param {string} name metric name
 * @returns {string} normalized metric name
 */
exports.normalizeMetricName = function(name) {
	return name.replace(/^[^a-zA-Z_:]+/, '').replace(/[^a-zA-Z0-9_:]+/g, '_');
};

exports.validateLabelName = function(names) {
	let valid = true;
	(names || []).forEach(name => {
		if (!labelRegexp.test(name)) {
			valid = false;
		}
	});
	return valid;
};

/**
 * normalize label name
 * @param {string} name label name
 * @returns {string} normalized label name
 */
exports.normalizeLabelName = function(name) {
	return name.replace(/^[^a-zA-Z_]+/, '').replace(/[^a-zA-Z0-9_]+/g, '_');
};

exports.validateLabel = function validateLabel(savedLabels, labels) {
	Object.keys(labels).forEach(label => {
		if (savedLabels.indexOf(label) === -1) {
			throw new Error(
				`Added label "${label}" is not included in initial labelset: ${util.inspect(
					savedLabels
				)}`
			);
		}
	});
};

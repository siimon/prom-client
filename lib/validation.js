'use strict';

const util = require('util');

// These are from https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
const metricRegexp = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;
const labelRegexp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const exemplarRegexp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

exports.validateMetricName = function (name) {
	return metricRegexp.test(name);
};

exports.validateLabelName = function (names) {
	let valid = true;
	(names || []).forEach(name => {
		if (!labelRegexp.test(name)) {
			valid = false;
		}
	});
	return valid;
};

exports.validateExemplarName = function (names) {
	let valid = true;
	(names || []).forEach(name => {
		if (!exemplarRegexp.test(name)) {
			valid = false;
		}
	});
	return valid;
};

exports.validateLabel = function validateLabel(savedLabels, labels) {
	Object.keys(labels).forEach(label => {
		if (savedLabels.indexOf(label) === -1) {
			throw new Error(
				`Added label "${label}" is not included in initial labelset: ${util.inspect(
					savedLabels,
				)}`,
			);
		}
	});
};

exports.validateExemplar = function validateLabel(
	savedExemplars,
	exemplars,
	exemplarValue,
) {
	Object.keys(exemplars).forEach(exemplar => {
		if (savedExemplars.indexOf(exemplar) === -1) {
			throw new Error(
				`Added label "${exemplar}" is not included in initial exemplarSet: ${util.inspect(
					savedExemplars,
				)}`,
			);
		}
	});

	// TODO both the value and the label set cannot be more than 128 chars
	// exemplar length cannot be more than 128 UTF-8 characters
	const exemplarLabelString = Object.entries(exemplars)
		.join('')
		.replace(/,/g, '');
	if ((exemplarLabelString + exemplarValue).length > 128) {
		throw new Error(
			`Exemplar label set cannot exceed 128 UTF-8 characters: current label set has ${exemplars.length} characters`,
		);
	}
};

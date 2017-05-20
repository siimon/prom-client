'use strict';

var util = require('util');

// These are from https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
var metricRegexp = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;
var labelRegexp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

exports.validateMetricName = function(name) {
	return metricRegexp.test(name);
};

exports.validateLabelName = function(names) {
	var valid = true;
	(names || []).forEach(function(name) {
		if(!labelRegexp.test(name)) {
			valid = false;
		}
	});
	return valid;
};

exports.validateLabel = function validateLabel(savedLabels, labels) {
	Object.keys(labels).forEach(function(label) {
		if(savedLabels.indexOf(label) === -1) {
			throw new Error('Added label "' + label + '" is not included in initial labelset: ' + util.inspect(savedLabels));
		}
	});
};

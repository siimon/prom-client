'use strict';

exports.validateMetricName = function(name) {
	var regexp = new RegExp('^[a-zA-Z_:][a-zA-Z0-9_:]*$');
	return regexp.test(name);
};

exports.validateLabelName = function(names) {
	var valid = true;
	var regexp = new RegExp('^[a-zA-Z_][a-zA-Z0-9_]*$');
	(names || []).forEach(function(name) {
		if(!regexp.test(name)) {
			valid = false;
		}
	});
	return valid;
};

exports.validateLabel = function validateLabel(savedLabels, labels) {
	Object.keys(labels).forEach(function(label) {
		if(savedLabels.indexOf(label) === -1) {
			throw new Error('Added label is not included in initial labelset');
		}
	});
};

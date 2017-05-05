/**
 * Histogram
 */
'use strict';

var globalRegistry = require('./register');
var type = 'histogram';
var isNumber = require('./util').isNumber;
var extend = require('util-extend');
var getProperties = require('./util').getPropertiesFromObj;
var getLabels = require('./util').getLabels;
var hashObject = require('./util').hashObject;
var validateLabels = require('./validation').validateLabel;
var validateMetricName = require('./validation').validateMetricName;
var validateLabelNames = require('./validation').validateLabelName;
var isObject = require('./util').isObject;

/**
 * Histogram
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {object|Array.<string>} labelsOrConf - Either array of label names or config object as a key-value object
 * @param {object} conf - Configuration object
 * @constructor
 */
function Histogram(name, help, labelsOrConf, conf) {
	var config;

	if(isObject(name)) {
		config = extend( {
			buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
			labelNames: [],
			registers: [ globalRegistry ],
		}, name);
	} else {
		var obj;
		var labels = [];

		if(Array.isArray(labelsOrConf)) {
			obj = conf || {};
			labels = labelsOrConf;
		} else {
			obj = labelsOrConf || {};
		}

		config = {
			name: name,
			labelNames: labels,
			help: help,
			buckets: configureUpperbounds(obj.buckets),
			registers: [ globalRegistry ]
		};
	}
	validateInput(config.name, config.help, config.labelNames);

	this.name = config.name;
	this.help = config.help;

	this.upperBounds = config.buckets;
	this.bucketValues = this.upperBounds.reduce(function(acc, upperBound) {
		acc[upperBound] = 0;
		return acc;
	}, {});

	Object.freeze(this.bucketValues);
	Object.freeze(this.upperBounds);
	this.sum = 0;
	this.count = 0;

	this.hashMap = {};
	this.labelNames = config.labelNames || [];

	var metric = this;
	config.registers.forEach(function(registryInstance) {
		registryInstance.registerMetric(metric);
	});
}

/**
 * Observe a value in histogram
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {Number} value - Value to observe in the histogram
 * @returns {void}
 */
Histogram.prototype.observe = function(labels, value) {
	observe.call(this, labels === 0 ? 0 : (labels || {}))(value);
};

Histogram.prototype.get = function() {
	var data = getProperties(this.hashMap);
	var values =
		data.map(extractBucketValuesForExport(this))
			.reduce(addSumAndCountForExport(this), []);

	return {
		name: this.name,
		help: this.help,
		type: type,
		values: values
	};
};

Histogram.prototype.reset = function() {
	this.sum = 0;
	this.count = 0;
	this.hashMap = {};
};

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
Histogram.prototype.startTimer = function(labels) {
	return startTimer.call(this, labels)();
};

Histogram.prototype.labels = function() {
	var labels = getLabels(this.labelNames, arguments);
	return {
		observe: observe.call(this, labels),
		startTimer: startTimer.call(this, labels)
	};
};

function startTimer(startLabels) {
	var histogram = this;
	return function() {
		var start = process.hrtime();
		return function(endLabels) {
			var delta = process.hrtime(start);
			histogram.observe(extend(startLabels || {}, endLabels),  delta[0] + delta[1] / 1e9);
		};
	};
}
function validateInput(name, help, labels) {
	if(!help) {
		throw new Error('Missing mandatory help parameter');
	}
	if(!name) {
		throw new Error('Missing mandatory name parameter');
	}

	if(!validateMetricName(name)) {
		throw new Error('Invalid metric name');
	}

	if(!validateLabelNames(labels)) {
		throw new Error('Invalid label name');
	}

	labels.forEach(function(label) {
		if(label === 'le') {
			throw new Error('le is a reserved label keyword');
		}
	});
}

function configureUpperbounds(configuredBuckets) {
	var defaultBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
	return [].concat((configuredBuckets || defaultBuckets)).sort(sortAscending);
}

function sortAscending(x, y) {
	return x - y;
}

function createValuePair(labels, value, metricName) {
	return {
		labels: labels,
		value: value,
		metricName: metricName
	};
}

function findBound(upperBounds, value) {
	for(var i = 0; i < upperBounds.length; i++) {
		var bound = upperBounds[i];
		if(value <= bound) {
			return bound;
		}

	}
	return -1;
}

function observe(labels) {
	var histogram = this;
	return function(value) {
		var labelValuePair = convertLabelsAndValues(labels, value);

		validateLabels(histogram.labelNames, labelValuePair.labels);
		if(!isNumber(labelValuePair.value)) {
			throw new Error('Value is not a valid number', labelValuePair.value);
		}

		var hash = hashObject(labelValuePair.labels);
		var valueFromMap = histogram.hashMap[hash];
		if(!valueFromMap) {
			valueFromMap = createBaseValues(labelValuePair.labels, extend({}, histogram.bucketValues));
		}

		var b = findBound(histogram.upperBounds, labelValuePair.value);

		valueFromMap.sum += labelValuePair.value;
		valueFromMap.count += 1;

		if(valueFromMap.bucketValues.hasOwnProperty(b)) {
			valueFromMap.bucketValues[b] += 1;
		}

		histogram.hashMap[hash] = valueFromMap;
	};
}

function createBaseValues(labels, bucketValues) {
	return {
		labels: labels,
		bucketValues: bucketValues,
		sum: 0,
		count: 0
	};
}

function convertLabelsAndValues(labels, value) {
	if(isNumber(labels)) {
		return {
			value: labels,
			labels: {}
		};
	}
	return {
		labels: labels,
		value: value
	};
}

function extractBucketValuesForExport(histogram) {
	return function(bucketData) {
		var buckets = histogram.upperBounds.map(createBucketValues(bucketData, histogram));
		return { buckets: buckets, data: bucketData };
	};
}

function addSumAndCountForExport(histogram) {
	return function(acc, d) {
		acc = acc.concat(d.buckets);

		var infLabel = extend({ le: '+Inf' }, d.data.labels);
		acc.push(createValuePair(infLabel, d.data.count, histogram.name + '_bucket'));
		acc.push(createValuePair(d.data.labels, d.data.sum, histogram.name + '_sum'));
		acc.push(createValuePair(d.data.labels, d.data.count, histogram.name + '_count'));
		return acc;
	};
}

function createBucketValues(bucket, histogram) {
	var acc = 0;
	return function(upperBound) {
		acc += bucket.bucketValues[upperBound];
		var lbls = extend({ le: upperBound }, bucket.labels);
		var valuePair = createValuePair(lbls, acc, histogram.name + '_bucket');
		return valuePair;
	};
}

module.exports = Histogram;

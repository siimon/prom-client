/**
 * Histogram
 */
'use strict';

var register = require('./register');
var type = 'histogram';
var isNumber = require('./util').isNumber;
var extend = require('util-extend');
var getProperties = require('./util').getPropertiesFromObj;
var validateLabels = require('./util').validateLabel;
var getLabels = require('./util').getLabels;
var createValue = require('./util');

/**
 * Histogram
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {object|array} labelsOrConf - Either array of label names or config object as a key-value object
 * @param {object} conf - Configuration object
 * @constructor
 */
function Histogram(name, help, labelsOrConf, conf) {
	var obj;
	var labels = [];
	if(Array.isArray(labelsOrConf)) {
		obj = conf || {};
		labels = labelsOrConf;
	} else {
		obj = labelsOrConf || {};
	}

	validateInput(name, help, labels);

	this.name = name;
	this.help = help;

	this.upperBounds = configureUpperbounds(obj.buckets);
	this.bucketValues = this.upperBounds.reduce(function(acc, upperBound) {
		acc[upperBound] = 0;
		return acc;
	}, {});

	Object.freeze(this.upperBounds);
	this.sum = 0;
	this.count = 0;

	this.hashMap = {};
	this.labelNames = labels || [];
	register.registerMetric(this);
}

/**
 * Observe a value in histogram
 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
 * @param {float} value - Value to observe in the histogram
 * @returns {void}
 */
Histogram.prototype.observe = function(labels, value) {
	observe.call(this, labels || {})(value);
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

function startTimer(labels) {
	var histogram = this;
	return function() {
		var start = new Date();
		return function() {
			var end = new Date();
			histogram.observe(labels, (end - start) / 1000);
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

	labels.forEach(function(label) {
		if(label === 'le') {
			throw new Error('le is a reserved label keyword');
		}
	});
}

function configureUpperbounds(configuredBuckets) {
	var defaultBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
	return (configuredBuckets || defaultBuckets).sort(sortAscending);
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
	//TODO: What to return?
}

function observe(labels) {
	var histogram = this;
	return function(value) {
		var labelValuePair = convertLabelsAndValues(labels, value);

		validateLabels(histogram.labelNames, labelValuePair.labels);
		if(!isNumber(labelValuePair.value)) {
			throw new Error('Value is not a valid number', labelValuePair.value);
		}

		var objectHash = require('object-hash');
		var hash = objectHash(labelValuePair.labels);
		var val = histogram.hashMap[hash];
		if(!val) {
			val = createBaseValues(labelValuePair.labels, histogram.bucketValues);
		}

		var b = findBound(histogram.upperBounds, labelValuePair.value);
		if(!histogram.bucketValues.hasOwnProperty(b)) {
			return;
		}

		val.bucketValues[b] += 1;
		val.sum += labelValuePair.value;
		val.count += 1;
		histogram.hashMap[hash] = val;
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

		var infLabel = extend({ le: '+Inf'}, d.data.labels);
		acc.push(createValuePair(infLabel, d.data.count, histogram.name + '_bucket'));
		acc.push(createValuePair(d.data.labels, d.data.sum, histogram.name + '_sum'));
		acc.push(createValuePair(d.data.labels, d.data.count, histogram.name + '_count'));
		return acc;
	};
}

function createBucketValues(bucket, histogram) {
	return function(upperBound) {
		var lbls = extend({ le: upperBound }, bucket.labels);
		var valuePair = createValuePair(lbls, bucket.bucketValues[upperBound], histogram.name + '_bucket');
		return valuePair;
	};
}

module.exports = Histogram;

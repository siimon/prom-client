/**
 * Histogram
 */
'use strict';

var register = require('./register');
var type = 'histogram';
var isNumber = require('./util').isNumber;
var extend = require('util-extend');

/**
 * Histogram
 * @param {string} name - Name of the metric
 * @param {string} help - Help for the metric
 * @param {object} obj - Configuration object
 * @constructor
 */
function Histogram(name, help, obj) {
	if(!help) {
		throw new Error('Missing mandatory help parameter');
	}
	if(!name) {
		throw new Error('Missing mandatory name parameter');
	}

	obj = obj || {};
	if(obj.labels && obj.labels.le) {
		throw new Error('Le is a reserved keyword and can not be used as a custom label');
	}

	var defaultUpperbounds = (obj.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]).sort(function(x, y) {
		return x - y;
	});
	this.name = name;
	this.help = help;
	this.upperBounds = defaultUpperbounds;
	this.bucketValues = this.upperBounds.reduce(function(acc, upperBound) {
		acc[upperBound] = 0;
		return acc;
	}, {});
	Object.freeze(this.upperBounds);
	this.sum = 0;
	this.count = 0;
	this.labels = {};
	register.registerMetric(this);
}

/**
 * Observe a value in histogram
 * @param {float} val - Value to observe in the histogram
 * @returns {void}
 */
Histogram.prototype.observe = function(val) {
	if(!isNumber(val)) {
		throw new Error('Value is not a valid number', val);
	}
	this.sum += val;
	this.count += 1;
	var b = findBound(this.upperBounds, val);
	this.bucketValues[b] += 1;
};

Histogram.prototype.get = function() {
	var histogram = this;
	var values = this.upperBounds.map(function(upperBound) {
		var lbls = extend({ le: upperBound }, histogram.labels);
		return createValuePair(lbls, histogram.bucketValues[upperBound], histogram.name + '_bucket');
	});
	values.push(createValuePair({ le: '+Inf' }, this.count, histogram.name + '_bucket'));
	values.push(createValuePair({}, this.sum, histogram.name + '_sum'));
	values.push(createValuePair({}, this.count, histogram.name + '_count'));
	return {
		name: this.name,
		help: this.help,
		type: type,
		values: values
	};
};

/**
 * Start a timer that could be used to logging durations
 * @returns {function} - Function to invoke when you want to stop the timer and observe the duration in seconds
 * @example
 * var end = histogram.startTimer();
 * makeExpensiveXHRRequest(function(err, res) {
 *	end(); //Observe the duration of expensiveXHRRequest
 * });
 */
Histogram.prototype.startTimer = function() {
	var start = new Date();
	var histogram = this;
	return function() {
		var end = new Date();
		histogram.observe((end - start) / 1000);
	};
};

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
module.exports = Histogram;

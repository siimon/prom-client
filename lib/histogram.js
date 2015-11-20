'use strict';

var register = require('./register');
var type = 'histogram';
function Histogram(obj) {
	var defaultUpperbounds = [.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10];
	this.name = obj.name;
	this.values = [];
	this.help = obj.help;
	this.upperBounds = defaultUpperbounds;
	this.bucketValues = this.upperBounds.reduce(function(acc, upperBound) {
		acc[upperBound] = 0;
		return acc;
	}, {});
	this.sum = 0;
	this.count = 0;
	register.registerMetric(this);
}

Histogram.prototype.observe = function(val) {
	this.sum += val;
	this.count += 1;
	var b = findBucket(this.upperBounds, val);
	this.bucketValues[b] += 1;
};

Histogram.prototype.get = function() {
	var histogram = this;
	var values = this.upperBounds.map(function(upperBound) {
		return createValuePair({ le: upperBound }, histogram.bucketValues[upperBound], histogram.name + '_bucket');
	});
	values.push(createValuePair({}, this.sum, histogram.name + '_sum'));
	values.push(createValuePair({}, this.count, histogram.name + '_count'));
	return {
		name: this.name,
		help: this.help,
		type: type,
		values: values
	};
};

function createValuePair(labels, value, metricName) {
	return {
		labels: labels,
		value: value,
		metricName: metricName
	};
}

function findBucket(buckets, value) {
	for(var i = 0; i < buckets.length; i++) {
		var bucket = buckets[i];
		if(value <= bucket) {
			return bucket.toString();
		}

	}
	//TODO: What to return?
}
module.exports = Histogram;

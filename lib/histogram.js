'use strict';

var register = require('./register');
function Histogram(obj) {
	var defaultBuckets = [.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10];
	var buckets = (obj.buckets || defaultBuckets).reduce(function(acc, bucket) {
		acc[bucket] = 0;
		return acc;
	}, {});
	this.name = obj.name;
	this.values = [];
	this.help = obj.help;
	this.buckets = buckets;
	this.sum = 0;
	this.count = 0;
	register.registerMetric(this);
}

Histogram.prototype.observe = function(val) {
	this.sum += val;
	this.count += 1;
	var b = this._findBucket(val);
	this.buckets[b] += val;
};

Histogram.prototype._findBucket = function(val) {
	var bucketFound;
	Object.keys(this.buckets).forEach(function(bucket) {
		if(bucket > val) {
			bucketFound = val;
			return;
		}
	});
	return bucketFound;
};

Histogram.prototype.get = function() {
	return {
		name: this.name,
		count: this.count,
		sum: this.sum,
		buckets: this.buckets
	};
};

module.exports = Histogram;

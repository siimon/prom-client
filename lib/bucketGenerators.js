'use strict';

exports.linearBuckets = function(start, width, count) {
	if(count < 1) {
		throw new Error('Linear buckets needs a positive count');
	}

	var buckets = new Array(count);
	for(var i = 0; i < count; i++) {
		buckets[i] = start;
		start += width;
	}
	return buckets;
};

exports.exponentialBuckets = function(start, factor, count) {
	if(start <= 0) {
		throw new Error('Exponential buckets needs a positive start');
	}
	if(count < 1) {
		throw new Error('Exponential buckets needs a positive count');
	}
	if(factor <= 1) {
		throw new Error('Exponential buckets needs a factor greater than 1');
	}
	var buckets = new Array(count);
	for(var i = 0; i < count; i++) {
		buckets[i] = start;
		start *= factor;
	}
	return buckets;
};

'use strict';

var Gauge = require('../gauge');
var v8;

try {
	v8 = require('v8');
} catch (e) {
  // node version is too old
  // probably we can use v8-heap-space-statistics for >=node-4.0.0 and <node-6.0.0
}

var METRICS = [
	'total',
	'used',
	'available'
];

var NODEJS_HEAP_SIZE = {};

METRICS.forEach(function(metricType) {
	NODEJS_HEAP_SIZE[metricType] = 'nodejs_heap_space_size_' + metricType + '_bytes';
});


module.exports = function() {
	if(typeof v8 === 'undefined' || typeof v8.getHeapSpaceStatistics !== 'function') {
		return function() {
		};
	}

	var gauges = {};

	METRICS.forEach(function(metricType) {
		gauges[metricType] = new Gauge(
      NODEJS_HEAP_SIZE[metricType],
      'Process heap space size ' + metricType + ' from node.js in bytes.',
      ['space']
    );
	});

	return function() {
		var data = {
			total: {},
			used: {},
			available: {}
		};
		var now = Date.now();

		v8.getHeapSpaceStatistics().forEach(function onEachSpace(space) {
			var spaceName = space.space_name.substr(0, space.space_name.indexOf('_space'));

			data.total[spaceName] = space.space_size;
			data.used[spaceName] = space.space_used_size;
			data.available[spaceName] = space.space_available_size;

			gauges.total.set({space: spaceName}, space.space_size, now);
			gauges.used.set({space: spaceName}, space.space_used_size, now);
			gauges.available.set({space: spaceName}, space.space_available_size, now);
		});

		return data;
	};
};

module.exports.metricNames = METRICS.map(function(metricType) {
	return NODEJS_HEAP_SIZE[metricType];
});

'use strict';

var Gauge = require('../gauge');

var NODEJS_HEAP_SIZE_TOTAL = 'nodejs_heap_size_total_bytes';
var NODEJS_HEAP_SIZE_USED = 'nodejs_heap_size_used_bytes';

module.exports = function() {
	if(typeof process.memoryUsage !== 'function') {
		return function() {
		};
	}

	var heapSizeTotal = new Gauge(NODEJS_HEAP_SIZE_TOTAL, 'Process heap size from node.js in bytes.');
	var heapSizeUsed = new Gauge(NODEJS_HEAP_SIZE_USED, 'Process heap size used from node.js in bytes.');

	return function() {
		var memUsage = process.memoryUsage();
		heapSizeTotal.set(memUsage.heapTotal);
		heapSizeUsed.set(memUsage.heapUsed);

		return { total: heapSizeTotal, used: heapSizeUsed };
	};
};

module.exports.metricNames = [NODEJS_HEAP_SIZE_TOTAL, NODEJS_HEAP_SIZE_USED];

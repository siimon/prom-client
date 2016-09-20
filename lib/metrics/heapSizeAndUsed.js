'use strict';

var Gauge = require('../gauge');
module.exports = function() {
	if(typeof process.memoryUsage !== 'function') {
		return function() {
		};
	}

	var heapSizeTotal = new Gauge('node_heap_size_total_bytes', 'Process heap size from node.js in bytes.');
	var heapSizeUsed = new Gauge('node_heap_size_used_bytes', 'Process heap size used from node.js in bytes.');

	return function() {
		var memUsage = process.memoryUsage();
		heapSizeTotal.set(memUsage.heapTotal);
		heapSizeUsed.set(memUsage.heapUsed);

		return { total: heapSizeTotal, used: heapSizeUsed };
	};
};

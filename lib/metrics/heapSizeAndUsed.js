'use strict';

var Gauge = require('../gauge');
module.exports = function() {
	if(typeof process.memoryUsage !== 'function') {
		return function() {
		};
	}

	var heapSizeTotal = new Gauge('process_heap_size_node_bytes', 'Process heap size from node.js in bytes.');
	var heapSizeUsed = new Gauge('process_heap_size_used_bytes', 'Process heap size used in bytes.');

	return function() {
		var memUsage = process.memoryUsage();
		heapSizeTotal.set(memUsage.heapTotal);
		heapSizeUsed.set(memUsage.heapUsed);

		return { total: heapSizeTotal, used: heapSizeUsed };
	};
};

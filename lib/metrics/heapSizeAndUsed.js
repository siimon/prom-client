'use strict';

var Gauge = require('../gauge');
var safeMemoryUsage = require('./helpers/safeMemoryUsage');

var NODEJS_HEAP_SIZE_TOTAL = 'nodejs_heap_size_total_bytes';
var NODEJS_HEAP_SIZE_USED = 'nodejs_heap_size_used_bytes';
var NODEJS_EXTERNAL_MEMORY = 'nodejs_external_memory_bytes';

module.exports = function() {
	if(typeof process.memoryUsage !== 'function') {
		return function() {
		};
	}

	var heapSizeTotal = new Gauge(NODEJS_HEAP_SIZE_TOTAL, 'Process heap size from node.js in bytes.');
	var heapSizeUsed = new Gauge(NODEJS_HEAP_SIZE_USED, 'Process heap size used from node.js in bytes.');

	var usage = safeMemoryUsage();
	if(usage && usage.external) {
		var externalMemUsed = new Gauge(NODEJS_EXTERNAL_MEMORY, 'Nodejs external memory size in bytes.');
	}

	return function() {
    // process.memoryUsage() can throw EMFILE errors, see #67
		var memUsage = safeMemoryUsage();
		if(memUsage) {
			heapSizeTotal.set(memUsage.heapTotal);
			heapSizeUsed.set(memUsage.heapUsed);
			if(memUsage.external && externalMemUsed) {
				externalMemUsed.set(memUsage.external);
			}
		}

		return {total: heapSizeTotal, used: heapSizeUsed, external: externalMemUsed};
	};
};

module.exports.metricNames = [NODEJS_HEAP_SIZE_TOTAL, NODEJS_HEAP_SIZE_USED, NODEJS_EXTERNAL_MEMORY];

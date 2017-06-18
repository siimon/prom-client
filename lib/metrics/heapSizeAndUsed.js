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

	var heapSizeTotal = new Gauge({ name: NODEJS_HEAP_SIZE_TOTAL, help: 'Process heap size from node.js in bytes.' });
	var heapSizeUsed = new Gauge({
		name: NODEJS_HEAP_SIZE_USED,
		help: 'Process heap size used from node.js in bytes.'
	});

	var usage = safeMemoryUsage();
	if(usage && usage.external) {
		var externalMemUsed = new Gauge({
			name: NODEJS_EXTERNAL_MEMORY,
			help: 'Nodejs external memory size in bytes.'
		});
	}

	return function() {
		// process.memoryUsage() can throw EMFILE errors, see #67
		var memUsage = safeMemoryUsage();
		if(memUsage) {
			var now = Date.now();
			heapSizeTotal.set(memUsage.heapTotal, now);
			heapSizeUsed.set(memUsage.heapUsed, now);
			if(memUsage.external && externalMemUsed) {
				externalMemUsed.set(memUsage.external, now);
			}
		}

		return { total: heapSizeTotal, used: heapSizeUsed, external: externalMemUsed };
	};
};

module.exports.metricNames = [NODEJS_HEAP_SIZE_TOTAL, NODEJS_HEAP_SIZE_USED, NODEJS_EXTERNAL_MEMORY];

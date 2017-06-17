'use strict';

const Gauge = require('../gauge');
const safeMemoryUsage = require('./helpers/safeMemoryUsage');

const NODEJS_HEAP_SIZE_TOTAL = 'nodejs_heap_size_total_bytes';
const NODEJS_HEAP_SIZE_USED = 'nodejs_heap_size_used_bytes';
const NODEJS_EXTERNAL_MEMORY = 'nodejs_external_memory_bytes';

module.exports = function() {
	if(typeof process.memoryUsage !== 'function') {
		return () => {
		};
	}

	const heapSizeTotal = new Gauge(NODEJS_HEAP_SIZE_TOTAL, 'Process heap size from node.js in bytes.');
	const heapSizeUsed = new Gauge(NODEJS_HEAP_SIZE_USED, 'Process heap size used from node.js in bytes.');
	let externalMemUsed;

	const usage = safeMemoryUsage();
	if(usage && usage.external) {
		externalMemUsed = new Gauge(NODEJS_EXTERNAL_MEMORY, 'Nodejs external memory size in bytes.');
	}

	return () => {
    	// process.memoryUsage() can throw EMFILE errors, see #67
		const memUsage = safeMemoryUsage();
		if(memUsage) {
			const now = Date.now();
			heapSizeTotal.set(memUsage.heapTotal, now);
			heapSizeUsed.set(memUsage.heapUsed, now);
			if(memUsage.external && externalMemUsed) {
				externalMemUsed.set(memUsage.external, now);
			}
		}

		return {total: heapSizeTotal, used: heapSizeUsed, external: externalMemUsed};
	};
};

module.exports.metricNames = [NODEJS_HEAP_SIZE_TOTAL, NODEJS_HEAP_SIZE_USED, NODEJS_EXTERNAL_MEMORY];

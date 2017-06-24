'use strict';

const Gauge = require('../gauge');
const safeMemoryUsage = require('./helpers/safeMemoryUsage');

const NODEJS_HEAP_SIZE_TOTAL = 'nodejs_heap_size_total_bytes';
const NODEJS_HEAP_SIZE_USED = 'nodejs_heap_size_used_bytes';
const NODEJS_EXTERNAL_MEMORY = 'nodejs_external_memory_bytes';

module.exports = registry => {
	if (typeof process.memoryUsage !== 'function') {
		return () => {};
	}

	const registers = registry ? [registry] : undefined;

	const heapSizeTotal = new Gauge({
		name: NODEJS_HEAP_SIZE_TOTAL,
		help: 'Process heap size from node.js in bytes.',
		registers
	});
	const heapSizeUsed = new Gauge({
		name: NODEJS_HEAP_SIZE_USED,
		help: 'Process heap size used from node.js in bytes.',
		registers
	});
	let externalMemUsed;

	const usage = safeMemoryUsage();
	if (usage && usage.external) {
		externalMemUsed = new Gauge({
			name: NODEJS_EXTERNAL_MEMORY,
			help: 'Nodejs external memory size in bytes.',
			registers
		});
	}

	return () => {
		// process.memoryUsage() can throw EMFILE errors, see #67
		const memUsage = safeMemoryUsage();
		if (memUsage) {
			const now = Date.now();
			heapSizeTotal.set(memUsage.heapTotal, now);
			heapSizeUsed.set(memUsage.heapUsed, now);
			if (memUsage.external && externalMemUsed) {
				externalMemUsed.set(memUsage.external, now);
			}
		}

		return {
			total: heapSizeTotal,
			used: heapSizeUsed,
			external: externalMemUsed
		};
	};
};

module.exports.metricNames = [
	NODEJS_HEAP_SIZE_TOTAL,
	NODEJS_HEAP_SIZE_USED,
	NODEJS_EXTERNAL_MEMORY
];

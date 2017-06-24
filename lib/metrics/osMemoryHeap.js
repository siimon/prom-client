'use strict';

const Gauge = require('../gauge');
const linuxVariant = require('./osMemoryHeapLinux');
const safeMemoryUsage = require('./helpers/safeMemoryUsage');

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

function notLinuxVariant(registry) {
	const residentMemGauge = new Gauge({
		name: PROCESS_RESIDENT_MEMORY,
		help: 'Resident memory size in bytes.',
		registers: registry ? [registry] : undefined
	});

	return () => {
		const memUsage = safeMemoryUsage();

		// I don't think the other things returned from `process.memoryUsage()` is relevant to a standard export
		if (memUsage) {
			residentMemGauge.set(memUsage.rss, Date.now());
		}
	};
}

module.exports = registry =>
	process.platform === 'linux'
		? linuxVariant(registry)
		: notLinuxVariant(registry);

module.exports.metricNames =
	process.platform === 'linux'
		? linuxVariant.metricNames
		: [PROCESS_RESIDENT_MEMORY];

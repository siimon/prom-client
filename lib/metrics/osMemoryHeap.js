'use strict';

const Gauge = require('../gauge');
const linuxVariant = require('./osMemoryHeapLinux');
const safeMemoryUsage = require('./helpers/safeMemoryUsage');

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

const notLinuxVariant = function() {
	const residentMemGauge = new Gauge({
		name: PROCESS_RESIDENT_MEMORY,
		help: 'Resident memory size in bytes.'
	});

	return () => {
		const memUsage = safeMemoryUsage();

		// I don't think the other things returned from `process.memoryUsage()` is relevant to a standard export
		if (memUsage) {
			residentMemGauge.set(memUsage.rss, Date.now());
		}
	};
};

module.exports = function() {
	return process.platform === 'linux' ? linuxVariant() : notLinuxVariant();
};

module.exports.metricNames = process.platform === 'linux'
	? linuxVariant.metricNames
	: [PROCESS_RESIDENT_MEMORY];

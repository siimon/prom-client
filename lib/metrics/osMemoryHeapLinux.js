'use strict';

const Gauge = require('../gauge');
const fs = require('fs');

const values = ['VmSize', 'VmRSS', 'VmData'];

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';
const PROCESS_VIRTUAL_MEMORY = 'process_virtual_memory_bytes';
const PROCESS_HEAP = 'process_heap_bytes';

function structureOutput(input) {
	const returnValue = {};

	input
		.split('\n')
		.filter(s => values.some(value => s.indexOf(value) === 0))
		.forEach(string => {
			const split = string.split(':');

			// Get the value
			let value = split[1].trim();
			// Remove trailing ` kb`
			value = value.substr(0, value.length - 3);
			// Make it into a number in bytes bytes
			value = Number(value) * 1024;

			returnValue[split[0]] = value;
		});

	return returnValue;
}

module.exports = registry => {
	const registers = registry ? [registry] : undefined;
	const residentMemGauge = new Gauge({
		name: PROCESS_RESIDENT_MEMORY,
		help: 'Resident memory size in bytes.',
		registers
	});
	const virtualMemGauge = new Gauge({
		name: PROCESS_VIRTUAL_MEMORY,
		help: 'Virtual memory size in bytes.',
		registers
	});
	const heapSizeMemGauge = new Gauge({
		name: PROCESS_HEAP,
		help: 'Process heap size in bytes.',
		registers
	});

	return () => {
		fs.readFile('/proc/self/status', 'utf8', (err, status) => {
			if (err) {
				return;
			}
			const now = Date.now();
			const structuredOutput = structureOutput(status);

			residentMemGauge.set(structuredOutput.VmRSS, now);
			virtualMemGauge.set(structuredOutput.VmSize, now);
			heapSizeMemGauge.set(structuredOutput.VmData, now);
		});
	};
};

module.exports.metricNames = [
	PROCESS_RESIDENT_MEMORY,
	PROCESS_VIRTUAL_MEMORY,
	PROCESS_HEAP
];

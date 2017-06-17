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
		.filter(s => {
			return values.some(value => {
				return s.indexOf(value) === 0;
			});
		})
		.forEach(string => {
			const split = string.split(':');

			// Get the value
			let value = split[1].trim();
			// Remove trailing ` kb`
			value = value.substr(0, value.length - 3);
			// Make it into a number in bytes bytes
			value = Number(value) * 1000;

			returnValue[split[0]] = value;
		});

	return returnValue;
}

module.exports = function() {
	const residentMemGauge = new Gauge(
		PROCESS_RESIDENT_MEMORY,
		'Resident memory size in bytes.'
	);
	const virtualMemGauge = new Gauge(
		PROCESS_VIRTUAL_MEMORY,
		'Virtual memory size in bytes.'
	);
	const heapSizeMemGauge = new Gauge(
		PROCESS_HEAP,
		'Process heap size in bytes.'
	);

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

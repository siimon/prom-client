'use strict';

var Gauge = require('../gauge');
var fs = require('fs');

var values = ['VmSize', 'VmRSS', 'VmData'];

var PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';
var PROCESS_VIRTUAL_MEMORY = 'process_virtual_memory_bytes';
var PROCESS_HEAP = 'process_heap_bytes';

function structureOutput(input) {
	var returnValue = {};

	input.split('\n')
		.filter(function(s) {
			return values.some(function(value) {
				return s.indexOf(value) === 0;
			});
		})
		.forEach(function(string) {
			var split = string.split(':');

			// Get the value
			var value = split[1].trim();
			// Remove trailing ` kb`
			value = value.substr(0, value.length - 3);
			// Make it into a number in bytes bytes
			value = Number(value) * 1000;

			returnValue[split[0]] = value;
		});

	return returnValue;
}

module.exports = function() {
	var residentMemGauge = new Gauge(PROCESS_RESIDENT_MEMORY, 'Resident memory size in bytes.');
	var virtualMemGauge = new Gauge(PROCESS_VIRTUAL_MEMORY, 'Virtual memory size in bytes.');
	var heapSizeMemGauge = new Gauge(PROCESS_HEAP , 'Process heap size in bytes.');

	return function() {
		fs.readFile('/proc/self/status', 'utf8', function(err, status) {
			if(err) {
				return;
			}
			var structuredOutput = structureOutput(status);

			residentMemGauge.set(null, structuredOutput.VmRSS);
			virtualMemGauge.set(null, structuredOutput.VmSize);
			heapSizeMemGauge.set(null, structuredOutput.VmData);
		});
	};
};

module.exports.metricNames = [PROCESS_RESIDENT_MEMORY, PROCESS_VIRTUAL_MEMORY, PROCESS_HEAP];

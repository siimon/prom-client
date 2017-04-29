'use strict';

var Gauge = require('../gauge');
var linuxVariant = require('./osMemoryHeapLinux');
var safeMemoryUsage = require('./helpers/safeMemoryUsage');

var PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

var notLinuxVariant = function() {
	var residentMemGauge = new Gauge(PROCESS_RESIDENT_MEMORY, 'Resident memory size in bytes.');

	return function() {
		var memUsage = safeMemoryUsage();

		// I don't think the other things returned from `process.memoryUsage()` is relevant to a standard export
		if(memUsage) {
			residentMemGauge.set(memUsage.rss, Date.now());
		}
	};
};

module.exports = function() {
	return process.platform === 'linux' ? linuxVariant() : notLinuxVariant();
};

module.exports.metricNames = process.platform === 'linux' ? linuxVariant.metricNames : [PROCESS_RESIDENT_MEMORY];

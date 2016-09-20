'use strict';

var Gauge = require('../gauge');
var linuxVariant = require('./osMemoryHeapLinux');
var notLinuxVariant = function() {
	var residentMemGauge = new Gauge('process_resident_memory_bytes', 'Resident memory size in bytes.');

	return function() {
		var memoryUsage = process.memoryUsage();

		// I don't think the other things returned from `process.memoryUsage()` is relevant to a standard export
		residentMemGauge.set(null, memoryUsage.rss);
	};
};

module.exports = function() {
	return process.platform === 'linux' ? linuxVariant() : notLinuxVariant();
};

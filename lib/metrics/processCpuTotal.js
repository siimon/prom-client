'use strict';

var Counter = require('../counter');
var PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

module.exports = function() {
	// Don't do anything if the function doesn't exist (introduced in node@6.1.0)
	if(typeof process.cpuUsage !== 'function') {
		return function() {
		};
	}

	var cpuUserCounter = new Counter(PROCESS_CPU_SECONDS, 'Total user and system CPU time spent in seconds.');
	var lastCpuUsage = process.cpuUsage();

	return function() {
		var cpuUsage = process.cpuUsage();
		var totalUsageMicros = (cpuUsage.user - lastCpuUsage.user)
			+ (cpuUsage.system - lastCpuUsage.system);
		lastCpuUsage = cpuUsage;

		cpuUserCounter.inc(totalUsageMicros / 1e6);
	};
};

module.exports.metricNames = [PROCESS_CPU_SECONDS];

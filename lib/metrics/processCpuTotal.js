'use strict';

var Counter = require('../counter');
var PROCESS_CPU_USER_SECONDS = 'process_cpu_user_seconds_total';
var PROCESS_CPU_SYSTEM_SECONDS = 'process_cpu_system_seconds_total';
var PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

module.exports = function() {
	// Don't do anything if the function doesn't exist (introduced in node@6.1.0)
	if(typeof process.cpuUsage !== 'function') {
		return function() {
		};
	}

	var cpuUserUsageCounter = new Counter(PROCESS_CPU_USER_SECONDS,
		'Total user CPU time spent in seconds.');
	var cpuSystemUsageCounter = new Counter(PROCESS_CPU_SYSTEM_SECONDS,
		'Total system CPU time spent in seconds.');
	var cpuUsageCounter = new Counter(PROCESS_CPU_SECONDS,
		'Total user and system CPU time spent in seconds.');

	var lastCpuUsage = process.cpuUsage();

	return function() {
		var cpuUsage = process.cpuUsage();

		var userUsageMicros = cpuUsage.user - lastCpuUsage.user;
		var systemUsageMicros = cpuUsage.system - lastCpuUsage.system;

		lastCpuUsage = cpuUsage;

		cpuUserUsageCounter.inc(userUsageMicros / 1e6);
		cpuSystemUsageCounter.inc(systemUsageMicros / 1e6);
		cpuUsageCounter.inc((userUsageMicros + systemUsageMicros) / 1e6);
	};
};

module.exports.metricNames = [
	PROCESS_CPU_USER_SECONDS, PROCESS_CPU_SYSTEM_SECONDS, PROCESS_CPU_SECONDS
];

'use strict';

const Counter = require('../counter');
const PROCESS_CPU_USER_SECONDS = 'process_cpu_user_seconds_total';
const PROCESS_CPU_SYSTEM_SECONDS = 'process_cpu_system_seconds_total';
const PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

module.exports = registry => {
	// Don't do anything if the function doesn't exist (introduced in node@6.1.0)
	if (typeof process.cpuUsage !== 'function') {
		return () => {};
	}

	const registers = registry ? [registry] : undefined;

	const cpuUserUsageCounter = new Counter({
		name: PROCESS_CPU_USER_SECONDS,
		help: 'Total user CPU time spent in seconds.',
		registers
	});
	const cpuSystemUsageCounter = new Counter({
		name: PROCESS_CPU_SYSTEM_SECONDS,
		help: 'Total system CPU time spent in seconds.',
		registers
	});
	const cpuUsageCounter = new Counter({
		name: PROCESS_CPU_SECONDS,
		help: 'Total user and system CPU time spent in seconds.',
		registers
	});

	let lastCpuUsage = process.cpuUsage();

	return () => {
		const cpuUsage = process.cpuUsage();
		const now = Date.now();

		const userUsageMicros = cpuUsage.user - lastCpuUsage.user;
		const systemUsageMicros = cpuUsage.system - lastCpuUsage.system;

		lastCpuUsage = cpuUsage;

		cpuUserUsageCounter.inc(userUsageMicros / 1e6, now);
		cpuSystemUsageCounter.inc(systemUsageMicros / 1e6, now);
		cpuUsageCounter.inc((userUsageMicros + systemUsageMicros) / 1e6, now);
	};
};

module.exports.metricNames = [
	PROCESS_CPU_USER_SECONDS,
	PROCESS_CPU_SYSTEM_SECONDS,
	PROCESS_CPU_SECONDS
];

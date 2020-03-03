'use strict';

const Counter = require('../counter');
const PROCESS_CPU_USER_SECONDS = 'process_cpu_user_seconds_total';
const PROCESS_CPU_SYSTEM_SECONDS = 'process_cpu_system_seconds_total';
const PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

module.exports = (registry, config = {}) => {
	const registers = registry ? [registry] : undefined;
	const namePrefix = config.prefix ? config.prefix : '';

	const cpuUserUsageCounter = new Counter({
		name: namePrefix + PROCESS_CPU_USER_SECONDS,
		help: 'Total user CPU time spent in seconds.',
		registers
	});
	const cpuSystemUsageCounter = new Counter({
		name: namePrefix + PROCESS_CPU_SYSTEM_SECONDS,
		help: 'Total system CPU time spent in seconds.',
		registers
	});
	const cpuUsageCounter = new Counter({
		name: namePrefix + PROCESS_CPU_SECONDS,
		help: 'Total user and system CPU time spent in seconds.',
		registers
	});

	let lastCpuUsage = process.cpuUsage();

	return () => {
		const cpuUsage = process.cpuUsage();

		const userUsageMicros = cpuUsage.user - lastCpuUsage.user;
		const systemUsageMicros = cpuUsage.system - lastCpuUsage.system;

		lastCpuUsage = cpuUsage;

		cpuUserUsageCounter.inc(userUsageMicros / 1e6);
		cpuSystemUsageCounter.inc(systemUsageMicros / 1e6);
		cpuUsageCounter.inc((userUsageMicros + systemUsageMicros) / 1e6);
	};
};

module.exports.metricNames = [
	PROCESS_CPU_USER_SECONDS,
	PROCESS_CPU_SYSTEM_SECONDS,
	PROCESS_CPU_SECONDS
];

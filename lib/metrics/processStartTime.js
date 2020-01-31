'use strict';

const Gauge = require('../gauge');
const startInSeconds = Math.round(Date.now() / 1000 - process.uptime());

const PROCESS_START_TIME = 'process_start_time_seconds';

module.exports = (registry, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const cpuUserGauge = new Gauge({
		name: namePrefix + PROCESS_START_TIME,
		help: 'Start time of the process since unix epoch in seconds.',
		registers: registry ? [registry] : undefined,
		aggregator: 'omit'
	});
	cpuUserGauge.set(startInSeconds);

	return () => {};
};

module.exports.metricNames = [PROCESS_START_TIME];

'use strict';

const Gauge = require('../gauge');
const nowInSeconds = Math.round(Date.now() / 1000 - process.uptime());

const PROCESS_START_TIME = 'process_start_time_seconds';

module.exports = registry => {
	const cpuUserGauge = new Gauge({
		name: PROCESS_START_TIME,
		help: 'Start time of the process since unix epoch in seconds.',
		registers: registry ? [registry] : undefined,
		aggregator: 'omit'
	});
	let isSet = false;

	return () => {
		if (isSet) {
			return;
		}
		cpuUserGauge.set(nowInSeconds);
		isSet = true;
	};
};

module.exports.metricNames = [PROCESS_START_TIME];

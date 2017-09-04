'use strict';

const Gauge = require('../gauge');

const NODEJS_EVENTLOOP_LAG = 'nodejs_eventloop_lag_seconds';

function reportEventloopLag(start, gauge) {
	const delta = process.hrtime(start);
	const nanosec = delta[0] * 1e9 + delta[1];
	const seconds = nanosec / 1e9;

	gauge.set(seconds, Date.now());
}

module.exports = registry => {
	const gauge = new Gauge({
		name: NODEJS_EVENTLOOP_LAG,
		help: 'Lag of event loop in seconds.',
		registers: registry ? [registry] : undefined,
		aggregator: 'average'
	});

	return () => {
		const start = process.hrtime();
		setImmediate(reportEventloopLag, start, gauge);
	};
};

module.exports.metricNames = [NODEJS_EVENTLOOP_LAG];

'use strict';

// Notes:
//
// Because legacy lag_seconds is collected async, the value will always lag by
// one scrape interval.
//
// Reconcile with:
// https://nodejs.org/api/perf_hooks.html#perf_hooks_perf_hooks_monitoreventloopdelay_options
//
// (perf_hooks exists only `>= v11.10.0`)
//
// - Delay would be a prom histogram, but perf_hooks doesn't support that yet.
// - Current possibility is to report h.max as the gauge value, which is
// somewhat compatible with the current code.
// - Might be possible to report perf_hook's histogram as a summary, using its
// percentile() function. Summaries are less than ideal with prometheus but at
// least the data is available in 12.x+. See #309

const Gauge = require('../gauge');

// Check if perf_hooks module is available
let perf_hooks;
try {
	/* eslint-disable node/no-unsupported-features/node-builtins */
	perf_hooks = require('perf_hooks');
} catch (e) {
	// node version is too old
}

const NODEJS_EVENTLOOP_LAG = 'nodejs_eventloop_lag_seconds';
const NODEJS_EVENTLOOP_LAG_MIN = 'nodejs_eventloop_lag_min_seconds';
const NODEJS_EVENTLOOP_LAG_MAX = 'nodejs_eventloop_lag_max_seconds';
const NODEJS_EVENTLOOP_LAG_MEAN = 'nodejs_eventloop_lag_mean_seconds';
const NODEJS_EVENTLOOP_LAG_STDDEV = 'nodejs_eventloop_lag_stddev_seconds';
const NODEJS_EVENTLOOP_LAG_P50 = 'nodejs_eventloop_lag_p50_seconds';
const NODEJS_EVENTLOOP_LAG_P90 = 'nodejs_eventloop_lag_p90_seconds';
const NODEJS_EVENTLOOP_LAG_P99 = 'nodejs_eventloop_lag_p99_seconds';

function reportEventloopLag(start, gauge) {
	const delta = process.hrtime(start);
	const nanosec = delta[0] * 1e9 + delta[1];
	const seconds = nanosec / 1e9;

	gauge.set(seconds);
}

module.exports = (registry, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const lag = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG,
		help: 'Lag of event loop in seconds.',
		registers: registry ? [registry] : undefined,
		aggregator: 'average'
	});
	const lagMin = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_MIN,
		help: 'The minimum recorded event loop delay.',
		registers: registry ? [registry] : undefined
	});
	const lagMax = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_MAX,
		help: 'The maximum recorded event loop delay.',
		registers: registry ? [registry] : undefined
	});
	const lagMean = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_MEAN,
		help: 'The mean of the recorded event loop delays.',
		registers: registry ? [registry] : undefined
	});
	const lagStddev = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_STDDEV,
		help: 'The standard deviation of the recorded event loop delays.',
		registers: registry ? [registry] : undefined
	});
	const lagP50 = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_P50,
		help: 'The 50th percentile of the recorded event loop delays.',
		registers: registry ? [registry] : undefined
	});
	const lagP90 = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_P90,
		help: 'The 90th percentile of the recorded event loop delays.',
		registers: registry ? [registry] : undefined
	});
	const lagP99 = new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_LAG_P99,
		help: 'The 99th percentile of the recorded event loop delays.',
		registers: registry ? [registry] : undefined
	});

	if (!perf_hooks || !perf_hooks.monitorEventLoopDelay) {
		return () => {
			const start = process.hrtime();
			setImmediate(reportEventloopLag, start, lag);
		};
	}

	const histogram = perf_hooks.monitorEventLoopDelay({
		resolution: config.eventLoopMonitoringPrecision
	});
	histogram.enable();

	return () => {
		const start = process.hrtime();
		setImmediate(reportEventloopLag, start, lag);

		lagMin.set(histogram.min / 1e9);
		lagMax.set(histogram.max / 1e9);
		lagMean.set(histogram.mean / 1e9);
		lagStddev.set(histogram.stddev / 1e9);
		lagP50.set(histogram.percentile(50) / 1e9);
		lagP90.set(histogram.percentile(90) / 1e9);
		lagP99.set(histogram.percentile(99) / 1e9);
	};
};

module.exports.metricNames = [
	NODEJS_EVENTLOOP_LAG,
	NODEJS_EVENTLOOP_LAG_MIN,
	NODEJS_EVENTLOOP_LAG_MAX,
	NODEJS_EVENTLOOP_LAG_MEAN,
	NODEJS_EVENTLOOP_LAG_STDDEV,
	NODEJS_EVENTLOOP_LAG_P50,
	NODEJS_EVENTLOOP_LAG_P90,
	NODEJS_EVENTLOOP_LAG_P99
];

'use strict';

const Counter = require('../counter');

// Check if metric is available
let nodeTiming;
try {
	/* eslint-disable node/no-unsupported-features/node-builtins */
	nodeTiming = require('perf_hooks').performance.nodeTiming;
} catch (ex) {
	// node version is too old
}

// Reported only when perf_hooks.performance.nodeTiming.idleTime is available.
const NODEJS_EVENTLOOP_IDLE = 'nodejs_eventloop_idle_seconds_total';

module.exports = (registry, config = {}) => {
	if (!nodeTiming || nodeTiming.idleTime === undefined) {
		return;
	}

	const namePrefix = config.prefix ? config.prefix : '';
	const labels = config.labels ? config.labels : {};
	const labelNames = Object.keys(labels);
	const registers = registry ? [registry] : undefined;

	let lastIdle = nodeTiming.idleTime;

	const idle = new Counter({
		name: namePrefix + NODEJS_EVENTLOOP_IDLE,
		help:
			"Total amount of time the event loop has been idle within the event loop's event provider",
		registers,
		labelNames,
		aggregator: 'average',
		collect() {
			const val = nodeTiming.idleTime / 1e3;
			idle.inc(labels, val - lastIdle);
			lastIdle = val;
		},
	});
};

module.exports.metricNames = [NODEJS_EVENTLOOP_IDLE];

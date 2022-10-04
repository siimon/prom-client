'use strict';

const Gauge = require('../gauge');

// Check if perf_hooks module is available
let perf_hooks;
try {
	/* eslint-disable node/no-unsupported-features/node-builtins */
	perf_hooks = require('perf_hooks');
} catch {
	// node version is too old
}

// Reported always.
const NODEJS_EVENTLOOP_UTILIZATION = 'nodejs_eventloop_utilization';

module.exports = (registry, config = {}) => {
	if (
		!perf_hooks ||
		!perf_hooks.performance ||
		!perf_hooks.performance.eventLoopUtilization
	) {
		return;
	}

	const eventLoopUtilization = perf_hooks.performance.eventLoopUtilization;

	const namePrefix = config.prefix ? config.prefix : '';
	const labels = config.labels ? config.labels : {};
	const labelNames = Object.keys(labels);
	const registers = registry ? [registry] : undefined;

	new Gauge({
		name: namePrefix + NODEJS_EVENTLOOP_UTILIZATION,
		help: 'Ratio of time the event loop is not idling in the event provider to the total time the event loop is running.',
		registers,
		labelNames,
		async collect() {
			const start = eventLoopUtilization();

			return new Promise(resolve => {
				setTimeout(() => {
					const end = eventLoopUtilization();
					this.set(labels, eventLoopUtilization(end, start).utilization);
					resolve();
				}, config.eventLoopUtilizationTimeout || 100);
			});
		},
	});
};

module.exports.metricNames = [NODEJS_EVENTLOOP_UTILIZATION];

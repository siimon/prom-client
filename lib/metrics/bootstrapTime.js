'use strict';
const Gauge = require('../gauge');

let perf_hooks;

try {
	// eslint-disable-next-line
	perf_hooks = require('perf_hooks');
} catch (e) {
	// node version is too old
}

// Constants ordered accordingly with order of events
const NODEJS_NODE_START = 'nodejs_node_start';
const NODEJS_V8_START = 'nodejs_v8_start';
const NODEJS_ENVIRONMENT_INITIALIZED = 'nodejs_environment_initialized';
const NODEJS_BOOTSTRAP_COMPLETE = 'nodejs_bootstrap_complete';
const NODEJS_LOOP_START = 'nodejs_loop_start';

module.exports = (registry, config = {}) => {
	if (!perf_hooks) {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';
	const nodeStart = new Gauge({
		name: namePrefix + NODEJS_NODE_START,
		help: 'Node process start time(in seconds).',
		registers: registry ? [registry] : undefined
	});
	const v8Start = new Gauge({
		name: namePrefix + NODEJS_V8_START,
		help: 'V8 start time (in seconds).',
		registers: registry ? [registry] : undefined
	});
	const environmentInitialized = new Gauge({
		name: namePrefix + NODEJS_ENVIRONMENT_INITIALIZED,
		help: 'Node.js environment initialization complete time (in seconds).',
		registers: registry ? [registry] : undefined
	});
	const bootstrapComplete = new Gauge({
		name: namePrefix + NODEJS_BOOTSTRAP_COMPLETE,
		help: 'Node.js bootstrap complete time (in seconds).',
		registers: registry ? [registry] : undefined
	});
	const loopStart = new Gauge({
		name: namePrefix + NODEJS_LOOP_START,
		help: 'Node.js event loop start time (in seconds).',
		registers: registry ? [registry] : undefined
	});

	return () => {
		const entry = perf_hooks.performance.nodeTiming;
		const now = Date.now();

		if (entry.nodeStart !== -1) {
			nodeStart.set({}, entry.nodeStart, now);
		}

		if (entry.v8Start !== -1) {
			v8Start.set({}, entry.v8Start, now);
		}

		if (entry.environment !== -1) {
			environmentInitialized.set({}, entry.environment, now);
		}

		if (entry.loopStart !== -1) {
			loopStart.set({}, entry.loopStart, now);
		}

		if (entry.bootstrapComplete !== -1) {
			bootstrapComplete.set({}, entry.bootstrapComplete, now);
		}
	};
};

module.exports.metricNames = [
	NODEJS_NODE_START,
	NODEJS_V8_START,
	NODEJS_ENVIRONMENT_INITIALIZED,
	NODEJS_BOOTSTRAP_COMPLETE,
	NODEJS_LOOP_START
];

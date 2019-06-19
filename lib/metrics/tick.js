'use strict';
const Counter = require('../counter');
const Summary = require('../summary');

let perf_hooks;
let async_hooks;

try {
	// eslint-disable-next-line
	perf_hooks = require('perf_hooks');
	// eslint-disable-next-line
	async_hooks = require('async_hooks');
} catch (e) {
	// node version is too old
}

const NODEJS_TICK_COUNT = 'nodejs_tick_count';
const NODEJS_TICK_DURATION_SUMMARY = 'nodejs_tick_duration_summary';

module.exports = (registry, config = {}) => {
	if (!perf_hooks || !async_hooks) {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';
	const tickCount = new Counter({
		name: namePrefix + NODEJS_TICK_COUNT,
		help: 'NO callbacks executed by procecc.nextTick()',
		registers: registry ? [registry] : undefined
	});
	const tickDurationSummary = new Summary({
		name: namePrefix + NODEJS_TICK_DURATION_SUMMARY,
		help: 'Summary of callbacks executed by procecc.nextTick()',
		maxAgeSeconds: 600,
		ageBuckets: 5,
		percentiles: [0.5, 0.75, 0.9, 0.99],
		registers: registry ? [registry] : undefined
	});

	const obs = new perf_hooks.PerformanceObserver(list => {
		const entries = list.getEntries();
		for (let i = 0; i < entries.length; i++) {
			tickCount.inc({}, 1);
			tickDurationSummary.observe({}, entries[i].duration / 1000);
		}
	});
	obs.observe({ entryTypes: ['measure'], buffered: true });

	const idToCallbackName = new Map();
	// eslint-disable-next-line
	const hook = async_hooks.createHook({
		init(id, type, triggerAsyncId, resource) {
			if (type === 'TickObject') {
				idToCallbackName[id] = resource.callback.name
					? resource.callback.name
					: `Tick-${id}`;
			}
		},
		before(id) {
			if (typeof idToCallbackName[id] !== 'undefined') {
				perf_hooks.performance.mark(`Tick-${id}-Before`);
			}
		},
		after(id) {
			if (typeof idToCallbackName[id] !== 'undefined') {
				perf_hooks.performance.mark(`Tick-${id}-After`);
			}
		},
		destroy(id) {
			if (typeof idToCallbackName[id] !== 'undefined') {
				perf_hooks.performance.measure(
					idToCallbackName[id],
					`Tick-${id}-Before`,
					`Tick-${id}-After`
				);

				idToCallbackName.delete(id);
			}
		}
	});
	hook.enable();

	return () => {};
};

module.exports.metricNames = [NODEJS_TICK_COUNT, NODEJS_TICK_DURATION_SUMMARY];

'use strict';
const Counter = require('../counter');
const Summary = require('../summary');

let perf_hooks;

try {
	// eslint-disable-next-line
	perf_hooks = require('perf_hooks');
} catch (e) {
	// node version is too old
}

const NODEJS_GC_RUNS = 'nodejs_gc_runs';
const NODEJS_GC_DURATION_SUMMARY = 'nodejs_gc_duration_summary';

function gcKindToString(gcKind) {
	let gcKindName = '';
	switch (gcKind) {
		case perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR:
			gcKindName = 'major';
			break;
		case perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR:
			gcKindName = 'minor';
			break;
		case perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL:
			gcKindName = 'incremental';
			break;
		case perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB:
			gcKindName = 'weakcb';
			break;
		default:
			gcKindName = 'unknown';
			break;
	}
	return gcKindName;
}

module.exports = (registry, config = {}) => {
	if (!perf_hooks) {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';
	const gcCount = new Counter({
		name: namePrefix + NODEJS_GC_RUNS,
		help:
			'Count of garbage collections. gc_type label is one of major, minor, incremental or weakcb.',
		labelNames: ['gc_type'],
		registers: registry ? [registry] : undefined
	});
	const gcSummary = new Summary({
		name: namePrefix + NODEJS_GC_DURATION_SUMMARY,
		help:
			'Summary of garbage collections. gc_type label is one of major, minor, incremental or weakcb.',
		labelNames: ['gc_type'],
		maxAgeSeconds: 600,
		ageBuckets: 5,
		percentiles: [0.5, 0.75, 0.9, 0.99],
		registers: registry ? [registry] : undefined
	});

	const obs = new perf_hooks.PerformanceObserver(list => {
		const entry = list.getEntries()[0];
		const labels = { gc_type: gcKindToString(entry.kind) };

		gcCount.inc(labels, 1);
		// Convert duration from milliseconds to seconds
		gcSummary.observe(labels, entry.duration / 1000);
	});

	// We do not expect too many gc events per second, so we do not use buffering
	obs.observe({ entryTypes: ['gc'], buffered: false });

	return () => {};
};

module.exports.metricNames = [NODEJS_GC_RUNS, NODEJS_GC_DURATION_SUMMARY];

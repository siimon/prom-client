'use strict';
const Counter = require('../counter');
const Histogram = require('../histogram');

let perf_hooks;

try {
	// eslint-disable-next-line
	perf_hooks = require('perf_hooks');
} catch (e) {
	// node version is too old
}

const NODEJS_GC_RUNS_TOTAL = 'nodejs_gc_runs_total';
const NODEJS_GC_DURATION = 'nodejs_gc_duration';
const DEFAULT_GC_DURATION_BUCKETS = [
	0.001,
	0.005,
	0.01,
	0.025,
	0.05,
	0.1,
	0.25,
	0.5,
	1,
	2.5,
	5
];

const kinds = [];
kinds[perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR] = 'major';
kinds[perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR] = 'minor';
kinds[perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL] = 'incremental';
kinds[perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB] = 'weakcb';

module.exports = (registry, config = {}) => {
	if (!perf_hooks) {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';
	const buckets = config.gcDurationBuckets
		? config.gcDurationBuckets
		: DEFAULT_GC_DURATION_BUCKETS;
	const gcCount = new Counter({
		name: namePrefix + NODEJS_GC_RUNS_TOTAL,
		help:
			'Count of garbage collections. kind label is one of major, minor, incremental or weakcb.',
		labelNames: ['kind'],
		registers: registry ? [registry] : undefined
	});
	const gcHistogram = new Histogram({
		name: namePrefix + NODEJS_GC_DURATION,
		help:
			'Histogram of garbage collections. kind label is one of major, minor, incremental or weakcb.',
		labelNames: ['kind'],
		buckets,
		registers: registry ? [registry] : undefined
	});

	const obs = new perf_hooks.PerformanceObserver(list => {
		const entry = list.getEntries()[0];
		const labels = { kind: kinds[entry.kind] };

		gcCount.inc(labels, 1);
		// Convert duration from milliseconds to seconds
		gcHistogram.observe(labels, entry.duration / 1000);
	});

	// We do not expect too many gc events per second, so we do not use buffering
	obs.observe({ entryTypes: ['gc'], buffered: false });

	return () => {};
};

module.exports.metricNames = [NODEJS_GC_RUNS_TOTAL, NODEJS_GC_DURATION];

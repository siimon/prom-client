'use strict';

const Gauge = require('../gauge');
const v8 = require('v8');

const NODEJS_HEAP_STATS = 'nodejs_heap_stats';

module.exports = (registry, config = {}) => {
	const registers = registry ? [registry] : undefined;
	const namePrefix = config.prefix ? config.prefix : '';

	const labels = config.labels ? config.labels : {};
	const labelNames = ['stat', ...Object.keys(labels)];

	const gauge = new Gauge({
		name: namePrefix + NODEJS_HEAP_STATS,
		help: `v8.getHeapStatistics() stats`,
		labelNames,
		registers,
	});

	gauge.collect = () => {
		for (const [stat, value] of Object.entries(v8.getHeapStatistics())) {
			gauge.set({stat: stat, ...labels}, value)
		}
	};
};

module.exports.metricNames = Object.values(NODEJS_HEAP_STATS);

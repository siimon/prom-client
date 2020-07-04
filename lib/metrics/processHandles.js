'use strict';

const { aggregateByObjectName } = require('./helpers/processMetricsHelpers');
const { updateMetrics } = require('./helpers/processMetricsHelpers');
const Gauge = require('../gauge');

const NODEJS_ACTIVE_HANDLES = 'nodejs_active_handles';
const NODEJS_ACTIVE_HANDLES_TOTAL = 'nodejs_active_handles_total';

module.exports = (registry, config = {}) => {
	// Don't do anything if the function is removed in later nodes (exists in node@6-12...)
	if (typeof process._getActiveHandles !== 'function') {
		return;
	}

	const registers = registry ? [registry] : undefined;
	const namePrefix = config.prefix ? config.prefix : '';

	new Gauge({
		name: namePrefix + NODEJS_ACTIVE_HANDLES,
		help:
			'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.',
		labelNames: ['type'],
		registers,
		collect() {
			const handles = process._getActiveHandles();
			updateMetrics(this, aggregateByObjectName(handles));
		},
	});
	new Gauge({
		name: namePrefix + NODEJS_ACTIVE_HANDLES_TOTAL,
		help: 'Total number of active handles.',
		registers,
		collect() {
			const handles = process._getActiveHandles();
			this.set(handles.length);
		},
	});
};

module.exports.metricNames = [
	NODEJS_ACTIVE_HANDLES,
	NODEJS_ACTIVE_HANDLES_TOTAL,
];

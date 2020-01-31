'use strict';

const { aggregateByObjectName } = require('./helpers/processMetricsHelpers');
const { updateMetrics } = require('./helpers/processMetricsHelpers');
const Gauge = require('../gauge');

const NODEJS_ACTIVE_HANDLES = 'nodejs_active_handles';
const NODEJS_ACTIVE_HANDLES_TOTAL = 'nodejs_active_handles_total';

module.exports = (registry, config = {}) => {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if (typeof process._getActiveHandles !== 'function') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const gauge = new Gauge({
		name: namePrefix + NODEJS_ACTIVE_HANDLES,
		help:
			'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.',
		labelNames: ['type'],
		registers: registry ? [registry] : undefined
	});
	const totalGauge = new Gauge({
		name: namePrefix + NODEJS_ACTIVE_HANDLES_TOTAL,
		help: 'Total number of active handles.',
		registers: registry ? [registry] : undefined
	});

	const updater = config.timestamps
		? () => {
				const handles = process._getActiveHandles();
				updateMetrics(gauge, aggregateByObjectName(handles), true);
				totalGauge.set(handles.length, Date.now());
		  }
		: () => {
				const handles = process._getActiveHandles();
				updateMetrics(gauge, aggregateByObjectName(handles), false);
				totalGauge.set(handles.length);
		  };

	return updater;
};

module.exports.metricNames = [
	NODEJS_ACTIVE_HANDLES,
	NODEJS_ACTIVE_HANDLES_TOTAL
];

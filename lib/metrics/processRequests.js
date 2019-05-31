'use strict';
const Gauge = require('../gauge');
const { aggregateByObjectName } = require('./helpers/processMetricsHelpers');
const { updateMetrics } = require('./helpers/processMetricsHelpers');

const NODEJS_ACTIVE_REQUESTS = 'nodejs_active_requests';
const NODEJS_ACTIVE_REQUESTS_TOTAL = 'nodejs_active_requests_total';

module.exports = (registry, config = {}) => {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if (typeof process._getActiveRequests !== 'function') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const gauge = new Gauge({
		name: namePrefix + NODEJS_ACTIVE_REQUESTS,
		help:
			'Number of active libuv requests grouped by request type. Every request type is C++ class name.',
		labelNames: ['type'],
		registers: registry ? [registry] : undefined
	});

	const totalGauge = new Gauge({
		name: namePrefix + NODEJS_ACTIVE_REQUESTS_TOTAL,
		help: 'Total number of active requests.',
		registers: registry ? [registry] : undefined
	});

	return () => {
		const requests = process._getActiveRequests();
		updateMetrics(gauge, aggregateByObjectName(requests));
		totalGauge.set(requests.length, Date.now());
	};
};

module.exports.metricNames = [
	NODEJS_ACTIVE_REQUESTS,
	NODEJS_ACTIVE_REQUESTS_TOTAL
];

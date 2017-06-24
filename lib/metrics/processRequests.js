'use strict';

const Gauge = require('../gauge');

const NODEJS_ACTIVE_REQUESTS = 'nodejs_active_requests_total';

module.exports = registry => {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if (typeof process._getActiveRequests !== 'function') {
		return () => {};
	}

	const gauge = new Gauge({
		name: NODEJS_ACTIVE_REQUESTS,
		help: 'Number of active requests.',
		registers: registry ? [registry] : undefined
	});

	return () => {
		gauge.set(process._getActiveRequests().length, Date.now());
	};
};

module.exports.metricNames = [NODEJS_ACTIVE_REQUESTS];

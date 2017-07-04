'use strict';

const Gauge = require('../gauge');

const NODEJS_ACTIVE_HANDLES = 'nodejs_active_handles_total';

module.exports = registry => {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if (typeof process._getActiveHandles !== 'function') {
		return () => {};
	}

	const gauge = new Gauge({
		name: NODEJS_ACTIVE_HANDLES,
		help: 'Number of active handles.',
		registers: registry ? [registry] : undefined
	});

	return () => {
		gauge.set(process._getActiveHandles().length, Date.now());
	};
};

module.exports.metricNames = [NODEJS_ACTIVE_HANDLES];

'use strict';

var Gauge = require('../gauge');

var NODEJS_ACTIVE_REQUESTS = 'nodejs_active_requests_total';

module.exports = function() {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if(typeof process._getActiveRequests !== 'function') {
		return function() {
		};
	}

	var gauge = new Gauge(NODEJS_ACTIVE_REQUESTS, 'Number of active requests.');

	return function() {
		gauge.set(process._getActiveRequests().length);
	};
};

module.exports.metricNames = [NODEJS_ACTIVE_REQUESTS];

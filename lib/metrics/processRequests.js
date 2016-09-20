'use strict';

var Gauge = require('../gauge');

module.exports = function() {    // Don't do anything if the function is removed in later nodes (exists in node@6)
	if(typeof process._getActiveRequests !== 'function') {
		return function() {
		};
	}

	var gauge = new Gauge('node_active_requests_total', 'Number of active requests.');

	return function() {
		gauge.set(process._getActiveRequests().length);
	};
};

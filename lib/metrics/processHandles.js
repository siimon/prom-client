'use strict';

var Gauge = require('../gauge');

module.exports = function() {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if(typeof process._getActiveHandles !== 'function') {
		return function() {
		};
	}

	var gauge = new Gauge('nodejs_active_handles_total', 'Number of active handles.');

	return function() {
		gauge.set(process._getActiveHandles().length);
	};
};

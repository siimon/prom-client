'use strict';

var Gauge = require('../gauge');

var NODEJS_EVENTLOOP_LAG = 'nodejs_eventloop_lag_seconds';

function reportEventloopLag(start, gauge) {
	var delta = process.hrtime(start);
	var nanosec = delta[0] * 1e9 + delta[1];
	var seconds = nanosec / 1e9;

	gauge.set(seconds);
}

module.exports = function() {
	var gauge = new Gauge(NODEJS_EVENTLOOP_LAG, 'Lag of event loop in seconds.');

	return function() {
		var start = process.hrtime();
		setImmediate(reportEventloopLag, start, gauge);
	};
};

module.exports.metricNames = [NODEJS_EVENTLOOP_LAG];

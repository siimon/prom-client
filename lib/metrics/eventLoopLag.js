'use strict';

var Gauge = require('../gauge');

var NODEJS_EVENTLOOP_LAG = 'nodejs_eventloop_lag_milliseconds';

function reportEventloopLag(start, gauge) {
	var delta = process.hrtime(start);
	var nanosec = delta[0] * 1e9 + delta[1];
	var ms = nanosec / 1e6;

	gauge.set(Math.round(ms));
}

module.exports = function() {
	var gauge = new Gauge(NODEJS_EVENTLOOP_LAG, 'Lag of event loop in milliseconds.');

	return function() {
		var start = process.hrtime();
		setImmediate(reportEventloopLag, start, gauge);
	};
};

module.exports.metricNames = [NODEJS_EVENTLOOP_LAG];

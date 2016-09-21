'use strict';

var Gauge = require('../gauge');
var nowInSeconds = Math.round(Date.now() / 1000 - process.uptime());

var PROCESS_START_TIME = 'process_start_time_seconds';

module.exports = function() {
	var cpuUserGauge = new Gauge(PROCESS_START_TIME, 'Start time of the process since unix epoch in seconds.');
	var isSet = false;

	return function() {
		if(isSet) {
			return;
		}
		cpuUserGauge.set(null, nowInSeconds);
		isSet = true;
	};
};

module.exports.metricNames = [PROCESS_START_TIME];

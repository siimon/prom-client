'use strict';

var Gauge = require('../gauge');
var fs = require('fs');

var PROCESS_MAX_FDS = 'process_max_fds';

module.exports = function() {
	var isSet = false;

	if(process.platform !== 'linux') {
		return function() {
		};
	}

	var fileDescriptorsGauge = new Gauge(PROCESS_MAX_FDS, 'Maximum number of open file descriptors.');

	return function() {
		if(isSet) {
			return;
		}

		fs.readFile('/proc/sys/fs/file-max', 'utf8', function(err, maxFds) {
			if(err) {
				return;
			}

			isSet = true;

			fileDescriptorsGauge.set(null, Number(maxFds));
		});
	};
};

module.exports.metricNames = [PROCESS_MAX_FDS];

'use strict';

var Gauge = require('../gauge');
var fs = require('fs');

var PROCESS_OPEN_FDS = 'process_open_fds';

module.exports = function() {
	if(process.platform !== 'linux') {
		return function() {
		};
	}

	var fileDescriptorsGauge = new Gauge(PROCESS_OPEN_FDS, 'Number of open file descriptors.');

	return function() {
		fs.readdir('/proc/self/fd', function(err, list) {
			if(err) {
				return;
			}

			// Minus 1, as this invocation created one
			fileDescriptorsGauge.set(null, list.length - 1);
		});
	};
};

module.exports.metricNames = [PROCESS_OPEN_FDS];

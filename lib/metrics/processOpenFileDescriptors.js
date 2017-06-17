'use strict';

const Gauge = require('../gauge');
const fs = require('fs');

const PROCESS_OPEN_FDS = 'process_open_fds';

module.exports = function() {
	if(process.platform !== 'linux') {
		return () => {
		};
	}

	const fileDescriptorsGauge = new Gauge(PROCESS_OPEN_FDS, 'Number of open file descriptors.');

	return () => {
		fs.readdir('/proc/self/fd', (err, list) => {
			if(err) {
				return;
			}

			// Minus 1, as this invocation created one
			fileDescriptorsGauge.set(list.length - 1, Date.now());
		});
	};
};

module.exports.metricNames = [PROCESS_OPEN_FDS];

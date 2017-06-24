'use strict';

const Gauge = require('../gauge');
const fs = require('fs');

const PROCESS_OPEN_FDS = 'process_open_fds';

module.exports = registry => {
	if (process.platform !== 'linux') {
		return () => {};
	}

	const fileDescriptorsGauge = new Gauge({
		name: PROCESS_OPEN_FDS,
		help: 'Number of open file descriptors.',
		registers: registry ? [registry] : undefined
	});

	return () => {
		fs.readdir('/proc/self/fd', (err, list) => {
			if (err) {
				return;
			}

			// Minus 1, as this invocation created one
			fileDescriptorsGauge.set(list.length - 1, Date.now());
		});
	};
};

module.exports.metricNames = [PROCESS_OPEN_FDS];

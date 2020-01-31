'use strict';

const Gauge = require('../gauge');
const fs = require('fs');
const process = require('process');

const PROCESS_OPEN_FDS = 'process_open_fds';

module.exports = (registry, config = {}) => {
	if (process.platform !== 'linux') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const fileDescriptorsGauge = new Gauge({
		name: namePrefix + PROCESS_OPEN_FDS,
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

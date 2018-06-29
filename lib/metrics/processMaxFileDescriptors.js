'use strict';

const Gauge = require('../gauge');
const fs = require('fs');

const PROCESS_MAX_FDS = 'process_max_fds';

module.exports = (registry, config = {}) => {
	let isSet = false;

	if (process.platform !== 'linux') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const fileDescriptorsGauge = new Gauge({
		name: namePrefix + PROCESS_MAX_FDS,
		help: 'Maximum number of open file descriptors.',
		registers: registry ? [registry] : undefined
	});

	return () => {
		if (isSet) {
			return;
		}

		fs.readFile('/proc/sys/fs/file-max', 'utf8', (err, maxFds) => {
			if (err) {
				return;
			}

			isSet = true;

			fileDescriptorsGauge.set(Number(maxFds));
		});
	};
};

module.exports.metricNames = [PROCESS_MAX_FDS];

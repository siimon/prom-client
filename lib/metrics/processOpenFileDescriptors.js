'use strict';

const Gauge = require('../gauge');
const fs = require('fs');
const process = require('process');

const PROCESS_OPEN_FDS = 'process_open_fds';

module.exports = (registry, config = {}) => {
	if (process.platform !== 'linux') {
		return;
	}

	const namePrefix = config.prefix ? config.prefix : '';

	new Gauge({
		name: namePrefix + PROCESS_OPEN_FDS,
		help: 'Number of open file descriptors.',
		registers: registry ? [registry] : undefined,
		collect() {
			try {
				const fds = fs.readdirSync('/proc/self/fd');
				// Minus 1 to not count the fd that was used by readdirSync(),
				// it's now closed.
				this.set(fds.length - 1);
			} catch {
				// noop
			}
		},
	});
};

module.exports.metricNames = [PROCESS_OPEN_FDS];

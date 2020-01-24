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

		fs.readFile('/proc/self/limits', 'utf8', (err, limits) => {
			if (err) {
				return;
			}

			const lines = limits.split('\n');

			let maxFds;
			lines.find(line => {
				if (line.startsWith('Max open files')) {
					const parts = line.split(/  +/);
					maxFds = parts[1];
					return true;
				}
			});

			if (maxFds === undefined) return;

			isSet = true;

			fileDescriptorsGauge.set(Number(maxFds));

			// Only for interal use by tests, so they know when the
			// value has been read.
			if (config.ready) {
				config.ready();
			}
		});
	};
};

module.exports.metricNames = [PROCESS_MAX_FDS];

'use strict';

const Gauge = require('../gauge');
const fs = require('fs');

const PROCESS_MAX_FDS = 'process_max_fds';

let maxFds;

module.exports = (registry, config = {}) => {
	if (maxFds === undefined) {
		// This will fail if a linux-like procfs is not available.
		try {
			const limits = fs.readFileSync('/proc/self/limits', 'utf8');
			const lines = limits.split('\n');
			lines.find(line => {
				if (line.startsWith('Max open files')) {
					const parts = line.split(/  +/);
					maxFds = Number(parts[1]);
					return true;
				}
			});
		} catch (er) {
			return () => {};
		}
	}

	if (maxFds === undefined) return () => {};

	const namePrefix = config.prefix ? config.prefix : '';
	const fileDescriptorsGauge = new Gauge({
		name: namePrefix + PROCESS_MAX_FDS,
		help: 'Maximum number of open file descriptors.',
		registers: registry ? [registry] : undefined
	});

	fileDescriptorsGauge.set(Number(maxFds));

	return () => {};
};

module.exports.metricNames = [PROCESS_MAX_FDS];

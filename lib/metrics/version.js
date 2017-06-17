'use strict';

const Gauge = require('../gauge');
const version = process.version;
const versionSegments = version.slice(1).split('.').map(Number);

const NODE_VERSION_INFO = 'nodejs_version_info';

module.exports = function() {
	const nodeVersionGauge = new Gauge(NODE_VERSION_INFO, 'Node.js version info.', ['version', 'major', 'minor', 'patch']);
	let isSet = false;

	return function() {
		if(isSet) {
			return;
		}
		nodeVersionGauge.labels(version, versionSegments[0], versionSegments[1], versionSegments[2]).set(1);
		isSet = true;
	};
};

module.exports.metricNames = [NODE_VERSION_INFO];

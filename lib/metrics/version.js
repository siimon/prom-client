'use strict';

var Gauge = require('../gauge');
var version = process.version;
var versionSegments = version.slice(1).split('.').map(Number);

var NODE_VERSION_INFO = 'nodejs_version_info';

module.exports = function() {
	var nodeVersionGauge = new Gauge(NODE_VERSION_INFO, 'Node.js version info.', ['version', 'major', 'minor', 'patch']);
	var isSet = false;

	return function() {
		if(isSet) {
			return;
		}
		nodeVersionGauge.labels(version, versionSegments[0], versionSegments[1], versionSegments[2]).set(1);
		isSet = true;
	};
};

module.exports.metricNames = [NODE_VERSION_INFO];

'use strict';

const processCpuTotal = require('./metrics/processCpuTotal');
const processStartTime = require('./metrics/processStartTime');
const osMemoryHeap = require('./metrics/osMemoryHeap');
const processOpenFileDescriptors = require('./metrics/processOpenFileDescriptors');
const processMaxFileDescriptors = require('./metrics/processMaxFileDescriptors');
const eventLoopLag = require('./metrics/eventLoopLag');
const processHandles = require('./metrics/processHandles');
const processRequests = require('./metrics/processRequests');
const heapSizeAndUsed = require('./metrics/heapSizeAndUsed');
const heapSpacesSizeAndUsed = require('./metrics/heapSpacesSizeAndUsed');
const version = require('./metrics/version');
const register = require('./register');

const metrics = {
	processCpuTotal: processCpuTotal,
	processStartTime: processStartTime,
	osMemoryHeap: osMemoryHeap,
	processOpenFileDescriptors: processOpenFileDescriptors,
	processMaxFileDescriptors: processMaxFileDescriptors,
	eventLoopLag: eventLoopLag,
	processHandles: processHandles,
	processRequests: processRequests,
	heapSizeAndUsed: heapSizeAndUsed,
	heapSpacesSizeAndUsed: heapSpacesSizeAndUsed,
	version: version
};
const metricsList = Object.keys(metrics);

let existingInterval = null;
// This is used to ensure the program throws on duplicate metrics during first run
// We might want to consider not supporting running the default metrics function more than once
let init = true;

module.exports = function startDefaultMetrics(interval) {
	if (existingInterval !== null) {
		clearInterval(existingInterval);
	}

	interval = interval || 10000;

	const initialisedMetrics = metricsList.map(metric => {
		const defaultMetric = metrics[metric];
		if (!init) {
			defaultMetric.metricNames.map(register.removeSingleMetric, register);
		}

		return defaultMetric();
	});

	function updateAllMetrics() {
		initialisedMetrics.forEach(metric => {
			metric.call();
		});
	}

	updateAllMetrics();

	existingInterval = setInterval(updateAllMetrics, interval).unref();

	init = false;

	return existingInterval;
};

module.exports.metricsList = metricsList;

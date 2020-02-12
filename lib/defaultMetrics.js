'use strict';

const { isObject } = require('./util');
const { globalRegistry } = require('./registry');

// Default metrics.
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
const gc = require('./metrics/gc');

const metrics = {
	processCpuTotal,
	processStartTime,
	osMemoryHeap,
	processOpenFileDescriptors,
	processMaxFileDescriptors,
	eventLoopLag,
	processHandles,
	processRequests,
	heapSizeAndUsed,
	heapSpacesSizeAndUsed,
	version,
	gc
};
const metricsList = Object.keys(metrics);

let existingInterval = null;
// This is used to ensure the program throws on duplicate metrics during first run
// We might want to consider not supporting running the default metrics function more than once
let init = true;

module.exports = function startDefaultMetrics(config) {
	if (config !== null && config !== undefined && !isObject(config)) {
		throw new Error('config must be null, undefined, or an object');
	}

	config = Object.assign(
		{
			timestamps: true,
			timeout: 10000
		},
		config
	);

	if (existingInterval !== null) {
		clearInterval(existingInterval);
	}

	const initialisedMetrics = metricsList.map(metric => {
		const defaultMetric = metrics[metric];
		if (!init) {
			defaultMetric.metricNames.map(
				globalRegistry.removeSingleMetric,
				globalRegistry
			);
		}

		return defaultMetric(config.register, config);
	});

	function updateAllMetrics() {
		initialisedMetrics.forEach(metric => metric.call());
	}

	updateAllMetrics();

	existingInterval = setInterval(updateAllMetrics, config.timeout).unref();

	init = false;

	return existingInterval;
};

module.exports.metricsList = metricsList;

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
const globalRegistry = require('./registry').globalRegistry;

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
	version
};
const metricsList = Object.keys(metrics);

let existingInterval = null;
// This is used to ensure the program throws on duplicate metrics during first run
// We might want to consider not supporting running the default metrics function more than once
let init = true;

module.exports = function startDefaultMetrics(config) {
	if (typeof config === 'number') {
		const deprecationWarning = new Error(
			`A number to defaultMetrics is deprecated, please use \`collectDefaultMetrics({ timeout: ${config} })\`.`
		);

		deprecationWarning.name = 'DeprecationWarning';

		// Check can be removed when we only support node@>=6
		if (process.emitWarning) {
			process.emitWarning(deprecationWarning);
		} else {
			// eslint-disable-next-line no-console
			console.error(deprecationWarning);
		}

		config = { timeout: config };
	}

	config = Object.assign({ timeout: 10000 }, config);

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

		return defaultMetric(config.register);
	});

	function updateAllMetrics() {
		initialisedMetrics.forEach(metric => {
			metric.call();
		});
	}

	updateAllMetrics();

	existingInterval = setInterval(updateAllMetrics, config.interval).unref();

	init = false;

	return existingInterval;
};

module.exports.metricsList = metricsList;

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

module.exports = function collectDefaultMetrics(config) {
	if (config !== null && config !== undefined && !isObject(config)) {
		throw new TypeError('config must be null, undefined, or an object');
	}

	config = Object.assign({ eventLoopMonitoringPrecision: 10 }, config);

	const registry = config.register || globalRegistry;
	const last = registry
		.collectors()
		.find(collector => collector._source === metrics);

	if (last) {
		throw new Error(
			'Cannot add the default metrics twice to the same registry'
		);
	}

	const scrapers = metricsList.map(key => {
		const metric = metrics[key];
		return metric(config.register, config);
	});

	// Ideally the library would be based around a concept of collectors and
	// async callbacks, but in the short-term, trigger scraping of the
	// current metric value synchronously.
	// - // https://prometheus.io/docs/instrumenting/writing_clientlibs/#overall-structure
	function defaultMetricCollector() {
		scrapers.forEach(scraper => scraper());
	}

	// defaultMetricCollector has to be dynamic, because the scrapers are in
	// its closure, but we still want to identify a default collector, so
	// tag it with a value known only to this module (the const metric array
	// value) so we can find it later.
	defaultMetricCollector._source = metrics;
	registry.registerCollector(defaultMetricCollector);

	// Because the tests expect an immediate collection.
	defaultMetricCollector();
};

module.exports.metricsList = metricsList;

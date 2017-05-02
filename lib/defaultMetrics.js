'use strict';

var processCpuTotal = require('./metrics/processCpuTotal');
var processStartTime = require('./metrics/processStartTime');
var osMemoryHeap = require('./metrics/osMemoryHeap');
var processOpenFileDescriptors = require('./metrics/processOpenFileDescriptors');
var processMaxFileDescriptors = require('./metrics/processMaxFileDescriptors');
var eventLoopLag = require('./metrics/eventLoopLag');
var processHandles = require('./metrics/processHandles');
var processRequests = require('./metrics/processRequests');
var heapSizeAndUsed = require('./metrics/heapSizeAndUsed');
var heapSpacesSizeAndUsed = require('./metrics/heapSpacesSizeAndUsed');
var version = require('./metrics/version');
var register = require('./register');

var metrics = {
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
var metricsList = Object.keys(metrics);

var existingInterval = null;
// This is used to ensure the program throws on duplicate metrics during first run
// We might want to consider not supporting running the default metrics function more than once
var init = true;

module.exports = function startDefaultMetrics(interval) {
	if(existingInterval !== null) {
		clearInterval(existingInterval);
	}

	interval = interval || 10000;

	var initialisedMetrics = metricsList
		.map(function(metric) {
			var defaultMetric = metrics[metric];
			if(!init) {
				defaultMetric.metricNames.map(register.removeSingleMetric, register);
			}

			return defaultMetric();
		});

	function updateAllMetrics() {
		initialisedMetrics.forEach(function(metric) {
			metric.call();
		});
	}

	updateAllMetrics();

	existingInterval = setInterval(updateAllMetrics, interval).unref();

	init = false;

	return existingInterval;
};

module.exports.metricsList = metricsList;

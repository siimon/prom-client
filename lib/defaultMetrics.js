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
	heapSizeAndUsed: heapSizeAndUsed
};

var existingInterval = null;

module.exports = function startDefaultMetrics(disabledMetrics, interval) {
	if(existingInterval !== null) {
		clearInterval(existingInterval);
	}

	disabledMetrics = disabledMetrics || [];
	interval = interval || 10000;

	var metricsInUse = Object.keys(metrics)
		.filter(function(metric) {
			return disabledMetrics.indexOf(metric) < 0;
		})
		.map(function(metric) {
			var defaultMetric = metrics[metric];
			defaultMetric.metricNames.forEach(register.removeSingleMetric);

			return defaultMetric();
		});

	function updateAllMetrics() {
		metricsInUse.forEach(function(metric) {
			metric.call();
		});
	}

	updateAllMetrics();

	existingInterval = setInterval(updateAllMetrics, interval).unref();

	return existingInterval;
};

module.exports.metricsList = Object.keys(metrics);

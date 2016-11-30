'use strict';

var metrics = {};

function getMetricsAsArray() {
	return Object.keys(metrics)
		.map(function(key) {
			return metrics[key];
		});
}

var getMetrics = function getMetrics() {
	return getMetricsAsArray().reduce(function(acc, metric) {
		var item = metric.get();
		var name = escapeString(item.name);
		var help = escapeString(item.help);
		help = ['#', 'HELP', name, help].join(' ');
		var type = ['#', 'TYPE', name, item.type].join(' ');

		var values = (item.values || []).reduce(function(valAcc, val) {
			var labels = Object.keys(val.labels || {}).map(function(key) {
				return key + '="' + escapeLabelValue(val.labels[key]) + '"';
			});

			var metricName = val.metricName || item.name;
			if(labels.length) {
				metricName += '{' + labels.join(',') + '}';
			}

			valAcc += [metricName, val.value].join(' ');
			valAcc += '\n';
			return valAcc;
		}, '');

		acc += [help, type, values].join('\n');
		return acc;
	}, '');
};

function escapeString(str) {
	return str.replace(/\n/g, '\\n').replace(/\\(?!n)/g, '\\\\');
}
function escapeLabelValue(str) {
	if(typeof str !== 'string') {
		return str;
	}
	return escapeString(str).replace(/"/g, '\\"');
}

var registerMetric = function registerMetric(metricFn) {
	if(metrics[metricFn.name]) {
		throw new Error('A metric with the name ' + metricFn.name + ' has already been registered.');
	}

	metrics[metricFn.name] = metricFn;
};

var clearMetrics = function clearMetrics() {
	metrics = {};
};

var getMetricsAsJSON = function getMetricsAsJSON() {
	return getMetricsAsArray().map(function(metric) {
		return metric.get();
	});
};

var removeSingleMetric = function removeSingleMetric(name) {
	delete metrics[name];
};

var getSingleMetric = function getSingleMetric(name) {
	return metrics[name];
};

module.exports = {
	registerMetric: registerMetric,
	metrics: getMetrics,
	clear: clearMetrics,
	getMetricsAsJSON: getMetricsAsJSON,
	removeSingleMetric: removeSingleMetric,
	getSingleMetric: getSingleMetric
};

'use strict';

var metrics = [];

var getMetrics = function getMetrics() {
	return metrics.reduce(function(acc, item) {
		var help = ['#', 'HELP', item.name, item.help].join(' ');
		var type = ['#', 'TYPE', item.name, item.type].join(' ');

		var labels = Object.keys(item.labels || {}).map(function(key) {
			return key + '="' + item.labels[key] + '"';
		});

		var metricName = item.name;
		if(labels.length) {
			metricName += '{' + labels.join(',') + '}';
		}
		var value = [metricName, item.value].join(' ');

		acc += [help, type, value].join('\n') + '\n';
		return acc;
	}, '');
};

var registerMetric = function registerMetric(metric) {
	metrics.push(metric);
};

var clearMetrics = function clearMetrics() {
	metrics = [];
};

module.exports = {
	registerMetric: registerMetric,
	metrics: getMetrics,
	clear: clearMetrics
};

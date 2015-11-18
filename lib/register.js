'use strict';

var metrics = [];

var getMetrics = function getMetrics() {
	return metrics.reduce(function(acc, item) {
		var help = ['#', 'HELP', item.name, item.help].join(' ');
		var type = ['#', 'TYPE', item.name, item.type].join(' ');

		var values = item.values.map(function(val) {
			var labels = Object.keys(val.labels || {}).map(function(key) {
				return key + '="' + val.labels[key] + '"';
			});

			var metricName = item.name;
			if(labels.length) {
				metricName += '{' + labels.join(',') + '}';
			}

			return [metricName, val.value, '\n'].join(' ');
		});

		acc += [help, type, values].join('\n');
		return acc;
	}, '').trim();
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

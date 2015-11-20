'use strict';

var metrics = [];

var getMetrics = function getMetrics() {
	return metrics.reduce(function(acc, metric) {
		var item = metric.get();
		var help = ['#', 'HELP', item.name, item.help].join(' ');
		var type = ['#', 'TYPE', item.name, item.type].join(' ');

		var values = item.values.map(function(val) {
			var labels = Object.keys(val.labels || {}).map(function(key) {
				return key + '="' + val.labels[key] + '"';
			});

			var metricName = item.metricName || item.name;
			if(labels.length) {
				metricName += '{' + labels.join(',') + '}';
			}

			return [metricName, val.value, '\n'].join(' ');
		});

		acc += [help, type, values].join('\n');
		return acc;
	}, '').trim();
};

var registerMetric = function registerMetric(metricFn) {
	metrics.push(metricFn);
};

var clearMetrics = function clearMetrics() {
	metrics = [];
};

module.exports = {
	registerMetric: registerMetric,
	metrics: getMetrics,
	clear: clearMetrics
};

'use strict';

var metrics = [];

var getMetrics = function getMetrics() {
	return metrics.reduce(function(acc, metric) {
		var item = metric.get();
		var help = ['#', 'HELP', item.name, item.help].join(' ');
		var type = ['#', 'TYPE', item.name, item.type].join(' ');

		var values = item.values.reduce(function(valAcc, val) {
			var labels = Object.keys(val.labels || {}).map(function(key) {
				return key + '="' + val.labels[key] + '"';
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

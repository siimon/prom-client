'use strict';

var metrics = [];

var getMetrics = function getMetrics() {
	return metrics.reduce(function(acc, metric) {
		var item = metric.get();
		var name = escapeString(item.name);
		var help = escapeString(item.help);
		var help = ['#', 'HELP', name, help].join(' ');
		var type = ['#', 'TYPE', name, item.type].join(' ');

		var values = (item.values || []).reduce(function(valAcc, val) {
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

function escapeString(str) {
	return str.replace('"', '\\"').replace('\\n', '\\\n').replace('\\', '\\\\');
}

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

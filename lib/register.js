'use strict';

var metrics = {};

var getMetrics = function getMetrics() {
	return Object.keys(metrics).reduce(function(acc, metricKey) {
		var item = metrics[metricKey].get();
		var name = escapeString(item.name);
		var help = escapeString(item.help);
		var help = ['#', 'HELP', name, help].join(' ');
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
  var name = metricFn.get().name;
  metrics[name] = metricFn;
};

var clearMetrics = function clearMetrics() {
  metrics = {};
};

var getMetricsAsJSON = function getMetricsAsJSON() {
  return Object.keys(metrics).map(function(metricName) {
    return metrics[metricName].get();
  });
};

module.exports = {
	registerMetric: registerMetric,
	metrics: getMetrics,
	clear: clearMetrics,
	getMetricsAsJSON: getMetricsAsJSON
};

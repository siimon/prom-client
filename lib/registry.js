'use strict';

var protobuf = require('protobufjs');
var path = require('path');
// TODO consider the possibility this gets loaded too late
var MetricFamily;
protobuf.load(path.resolve( __dirname, '../metrics.proto'), function(err, root) {
	if(err !== null) {
		throw err;
	}
	MetricFamily = root.lookupType('io.prometheus.client.MetricFamily');
});

function escapeString(str) {
	return str.replace(/\n/g, '\\n').replace(/\\(?!n)/g, '\\\\');
}
function escapeLabelValue(str) {
	if(typeof str !== 'string') {
		return str;
	}
	return escapeString(str).replace(/"/g, '\\"');
}
var registry = (function() {
	var _metrics = {};
	var self;
	function Registry() {
		self = this;
	}

	Registry.prototype.getMetricsAsArray = function() {
		return Object.keys(_metrics)
			.map(self.getSingleMetric, self);
	};

	Registry.prototype.getMetricAsPrometheusString = function(metric) {
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

			valAcc += [metricName, val.value, val.timestamp].join(' ').trim();
			valAcc += '\n';
			return valAcc;
		}, '');

		var acc = [help, type, values].join('\n');
		return acc;
	};

	Registry.prototype.metrics = function() {
		return self.getMetricsAsArray()
			.map(this.getMetricAsPrometheusString, this)
			.join('\n');
	};

	Registry.prototype.metricsProtobuf = function() {
		var writer = new protobuf.Writer.create();
		var metrics = this.getMetricsAsProtobufJSON();
		var metricsLength = metrics.length;
		for(var i = 0; i < metricsLength; i++) {
			var message = MetricFamily.fromObject(metrics[i]);
			var err = MetricFamily.verify(message);
			if(err !== null) {
				throw err;
			}
			MetricFamily.encode(message, writer.fork()).ldelim();
		}
		return writer.finish();
	};

	Registry.prototype.registerMetric = function(metricFn) {
		if(_metrics[metricFn.name] && _metrics[metricFn.name] !== metricFn) {
			throw new Error('A metric with the name ' + metricFn.name + ' has already been registered.');
		}

		_metrics[metricFn.name] = metricFn;
	};

	Registry.prototype.clear = function() {
		_metrics = {};
	};

	Registry.prototype.getMetricsAsJSON = function() {
		return self.getMetricsAsArray().map(function(metric) {
			return metric.get();
		});
	};

	Registry.prototype.getMetricsAsProtobufJSON = function() {
		return getMetricsAsArray().map(function(metric) {
			return metric.getProtoCompliant();
		});
	};

	Registry.prototype.removeSingleMetric = function(name) {
		delete _metrics[name];
	};

	Registry.prototype.getSingleMetricAsString = function(name) {
		return this.getMetricAsPrometheusString(_metrics[name]);
	};

	Registry.prototype.getSingleMetric = function(name) {
		return _metrics[name];
	};

	Registry.prototype.contentType = 'text/plain; version=0.0.4; charset=utf-8';
	Registry.prototype.contentTypeProto = 'application/vnd.google.protobuf;proto=io.prometheus.client.MetricFamily;encoding=delimited';
	return new Registry();
});

module.exports = registry;

registry.merge = function(registers) {
	var mergedRegistry = new registry();

	var metricsToMerge = registers.reduce(function(acc, reg) {
		return acc.concat(reg.getMetricsAsArray());
	}, []);

	metricsToMerge.forEach(mergedRegistry.registerMetric);
	return mergedRegistry;
};

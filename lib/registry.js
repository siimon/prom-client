'use strict';

function escapeString(str) {
	return str.replace(/\n/g, '\\n').replace(/\\(?!n)/g, '\\\\');
}
function escapeLabelValue(str) {
	if (typeof str !== 'string') {
		return str;
	}
	return escapeString(str).replace(/"/g, '\\"');
}
const registry = function() {
	let _metrics = {};
	let self;
	function Registry() {
		self = this;
	}

	Registry.prototype.getMetricsAsArray = function() {
		return Object.keys(_metrics).map(self.getSingleMetric, self);
	};

	Registry.prototype.getMetricAsPrometheusString = function(metric) {
		const item = metric.get();
		const name = escapeString(item.name);
		let help = escapeString(item.help);
		help = ['#', 'HELP', name, help].join(' ');
		const type = ['#', 'TYPE', name, item.type].join(' ');

		const values = (item.values || []).reduce((valAcc, val) => {
			const labels = Object.keys(val.labels || {}).map(
				key => `${key}="${escapeLabelValue(val.labels[key])}"`
			);

			let metricName = val.metricName || item.name;
			if (labels.length) {
				metricName += `{${labels.join(',')}}`;
			}

			valAcc += [metricName, val.value, val.timestamp].join(' ').trim();
			valAcc += '\n';
			return valAcc;
		}, '');

		const acc = [help, type, values].join('\n');
		return acc;
	};

	Registry.prototype.metrics = function() {
		return self
			.getMetricsAsArray()
			.map(this.getMetricAsPrometheusString, this)
			.join('\n');
	};

	Registry.prototype.registerMetric = function(metricFn) {
		if (_metrics[metricFn.name] && _metrics[metricFn.name] !== metricFn) {
			throw new Error(
				`A metric with the name ${metricFn.name} has already been registered.`
			);
		}

		_metrics[metricFn.name] = metricFn;
	};

	Registry.prototype.clear = function() {
		_metrics = {};
	};

	Registry.prototype.getMetricsAsJSON = function() {
		return self.getMetricsAsArray().map(metric => metric.get());
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
	return new Registry();
};

module.exports = registry;

registry.merge = function(registers) {
	const mergedRegistry = new registry();

	const metricsToMerge = registers.reduce(
		(acc, reg) => acc.concat(reg.getMetricsAsArray()),
		[]
	);

	metricsToMerge.forEach(mergedRegistry.registerMetric);
	return mergedRegistry;
};

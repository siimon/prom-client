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

class Registry {
	constructor() {
		this._metrics = {};
	}

	getMetricsAsArray() {
		return Object.keys(this._metrics).map(this.getSingleMetric, this);
	}

	getMetricAsPrometheusString(metric) {
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
	}

	metrics() {
		return this.getMetricsAsArray()
			.map(this.getMetricAsPrometheusString, this)
			.join('\n');
	}

	registerMetric(metricFn) {
		if (
			this._metrics[metricFn.name] &&
			this._metrics[metricFn.name] !== metricFn
		) {
			throw new Error(
				`A metric with the name ${metricFn.name} has already been registered.`
			);
		}

		this._metrics[metricFn.name] = metricFn;
	}

	clear() {
		this._metrics = {};
	}

	getMetricsAsJSON() {
		return this.getMetricsAsArray().map(metric => metric.get());
	}

	removeSingleMetric(name) {
		delete this._metrics[name];
	}

	getSingleMetricAsString(name) {
		return this.getMetricAsPrometheusString(this._metrics[name]);
	}

	getSingleMetric(name) {
		return this._metrics[name];
	}

	get contentType() {
		return 'text/plain; version=0.0.4; charset=utf-8';
	}

	static merge(registers) {
		const mergedRegistry = new Registry();

		const metricsToMerge = registers.reduce(
			(acc, reg) => acc.concat(reg.getMetricsAsArray()),
			[]
		);

		metricsToMerge.forEach(mergedRegistry.registerMetric, mergedRegistry);
		return mergedRegistry;
	}
}

module.exports = Registry;

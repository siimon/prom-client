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

const defaultMetricsOpts = {
	timestamps: true
};

class Registry {
	constructor() {
		this._metrics = {};
		this._defaultLabels = {};
	}

	getMetricsAsArray() {
		return Object.keys(this._metrics).map(this.getSingleMetric, this);
	}

	getMetricAsPrometheusString(metric, conf) {
		const opts = Object.assign({}, defaultMetricsOpts, conf);
		const item = metric.get();
		const name = escapeString(item.name);
		let help = escapeString(item.help);
		help = ['#', 'HELP', name, help].join(' ');
		const type = ['#', 'TYPE', name, item.type].join(' ');

		const values = (item.values || []).reduce((valAcc, val) => {
			const merged = Object.assign({}, this._defaultLabels, val.labels);

			const labels = Object.keys(merged).map(
				key => `${key}="${escapeLabelValue(merged[key])}"`
			);

			let metricName = val.metricName || item.name;
			if (labels.length) {
				metricName += `{${labels.join(',')}}`;
			}

			const line = [metricName, val.value];
			if (opts.timestamps) {
				line.push(val.timestamp);
			}
			valAcc += line.join(' ').trim();
			valAcc += '\n';
			return valAcc;
		}, '');

		const acc = [help, type, values].join('\n');
		return acc;
	}

	metrics(opts) {
		return this.getMetricsAsArray()
			.map(metric => this.getMetricAsPrometheusString(metric, opts))
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
		this._defaultLabels = {};
	}

	getMetricsAsJSON() {
		return this.getMetricsAsArray().map(metric => {
			const item = metric.get();
			if (!item.values) {
				return item;
			}

			item.values = item.values.map(val =>
				// Avoid mutation and merge metric labels with registry default labels
				Object.assign({}, val, {
					labels: Object.assign({}, this._defaultLabels, val.labels)
				})
			);

			return item;
		});
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

	setDefaultLabels(labels) {
		this._defaultLabels = labels;
	}

	resetMetrics() {
		for (const metric in this._metrics) {
			this._metrics[metric].reset();
		}
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
module.exports.globalRegistry = new Registry();

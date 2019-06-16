'use strict';

const { escapeLabelValue } = require('./util');

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

	getMetricAsPrometheusString(metric, conf = {}) {
		const timestamps =
			conf.timestamps === undefined ? defaultMetricsOpts : conf.timestamps;
		return metric.getPrometheusString(timestamps, this._defaultLabels);
	}

	metrics(opts) {
		let metrics = '';

		for (const metric of this.getMetricsAsArray()) {
			metrics += `${this.getMetricAsPrometheusString(metric, opts)}\n`;
		}

		return metrics.substring(0, metrics.length - 1);
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
		const metrics = [];
		const defaultLabelNames = Object.keys(this._defaultLabels);

		for (const metric of this.getMetricsAsArray()) {
			const item = metric.get();

			if (item.values) {
				for (const val of item.values) {
					for (const labelName of defaultLabelNames) {
						val.labels[labelName] =
							val.labels[labelName] || this._defaultLabels[labelName];
					}
				}
			}

			metrics.push(item);
		}

		return metrics;
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
		for (const name of Object.keys(this._defaultLabels)) {
			this._defaultLabels[name] = escapeLabelValue(this._defaultLabels[name]);
		}
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

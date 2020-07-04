'use strict';
const { getValueAsString } = require('./util');

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
		this._collectors = [];
		this._defaultLabels = {};
	}

	getMetricsAsArray() {
		return Object.values(this._metrics);
	}

	async getMetricAsPrometheusString(metric) {
		const item = await metric.get();
		const name = escapeString(item.name);
		const help = `# HELP ${name} ${escapeString(item.help)}`;
		const type = `# TYPE ${name} ${item.type}`;
		const defaultLabelNames = Object.keys(this._defaultLabels);

		let values = '';
		for (const val of item.values || []) {
			val.labels = val.labels || {};

			if (defaultLabelNames.length > 0) {
				// Make a copy before mutating
				val.labels = Object.assign({}, val.labels);

				for (const labelName of defaultLabelNames) {
					val.labels[labelName] =
						val.labels[labelName] || this._defaultLabels[labelName];
				}
			}

			let metricName = val.metricName || item.name;

			const keys = Object.keys(val.labels);
			const size = keys.length;
			if (size > 0) {
				let labels = '';
				let i = 0;
				for (; i < size - 1; i++) {
					labels += `${keys[i]}="${escapeLabelValue(val.labels[keys[i]])}",`;
				}
				labels += `${keys[i]}="${escapeLabelValue(val.labels[keys[i]])}"`;
				metricName += `{${labels}}`;
			}

			values += `${metricName} ${getValueAsString(val.value)}\n`;
		}

		return `${help}\n${type}\n${values}`.trim();
	}

	async metrics() {
		const promises = [];

		for (const metric of this.getMetricsAsArray()) {
			promises.push(this.getMetricAsPrometheusString(metric));
		}

		const resolves = await Promise.all(promises);

		return `${resolves.join('\n\n')}\n`;
	}

	registerMetric(metric) {
		if (this._metrics[metric.name] && this._metrics[metric.name] !== metric) {
			throw new Error(
				`A metric with the name ${metric.name} has already been registered.`,
			);
		}

		this._metrics[metric.name] = metric;
	}

	clear() {
		this._metrics = {};
		this._defaultLabels = {};
	}

	async getMetricsAsJSON() {
		const metrics = [];
		const defaultLabelNames = Object.keys(this._defaultLabels);

		const promises = [];

		for (const metric of this.getMetricsAsArray()) {
			promises.push(metric.get());
		}

		const resolves = await Promise.all(promises);

		for (const item of resolves) {
			if (item.values && defaultLabelNames.length > 0) {
				for (const val of item.values) {
					// Make a copy before mutating
					val.labels = Object.assign({}, val.labels);

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
			[],
		);

		metricsToMerge.forEach(mergedRegistry.registerMetric, mergedRegistry);
		return mergedRegistry;
	}
}

module.exports = Registry;
module.exports.globalRegistry = new Registry();

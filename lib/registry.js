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
function standardizeCounterName(name) {
	if (name.endsWith('_total')) {
		return name.replace('_total', '');
	}
	return name;
}

class Registry {
	static get PROMETHEUS_CONTENT_TYPE() {
		return 'text/plain; version=0.0.4; charset=utf-8';
	}

	static get OPENMETRICS_CONTENT_TYPE() {
		return 'application/openmetrics-text; version=1.0.0; charset=utf-8';
	}

	constructor(regContentType = Registry.PROMETHEUS_CONTENT_TYPE) {
		this._metrics = {};
		this._collectors = [];
		this._defaultLabels = {};
		if (
			regContentType !== Registry.PROMETHEUS_CONTENT_TYPE &&
			regContentType !== Registry.OPENMETRICS_CONTENT_TYPE
		) {
			throw new TypeError('Content type unsupported');
		}
		this._contentType = regContentType;
	}

	getMetricsAsArray() {
		return Object.values(this._metrics);
	}

	getLabelSetAsString(metric) {
		const defaultLabelNames = Object.keys(this._defaultLabels);
		let values = '';

		for (const val of metric.values || []) {
			val.labels = val.labels || {};

			if (defaultLabelNames.length > 0) {
				// Make a copy before mutating
				val.labels = Object.assign({}, val.labels);

				for (const labelName of defaultLabelNames) {
					val.labels[labelName] =
						val.labels[labelName] || this._defaultLabels[labelName];
				}
			}

			let metricName = val.metricName || metric.name;
			if (
				this.contentType === Registry.OPENMETRICS_CONTENT_TYPE &&
				metric.type === 'counter'
			) {
				metricName = `${metricName}_total`;
			}

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
			values += `${metricName} ${getValueAsString(val.value)}`;
			if (
				val.exemplar &&
				this.contentType === Registry.OPENMETRICS_CONTENT_TYPE
			) {
				const exemplarKeys = Object.keys(val.exemplar.labelSet);
				const exemplarSize = exemplarKeys.length;
				if (exemplarSize > 0) {
					let labels = '';
					let i = 0;
					for (; i < exemplarSize - 1; i++) {
						labels += `${exemplarKeys[i]}="${escapeLabelValue(
							val.exemplar.labelSet[exemplarKeys[i]],
						)}",`;
					}
					labels += `${exemplarKeys[i]}="${escapeLabelValue(
						val.exemplar.labelSet[exemplarKeys[i]],
					)}"`;
					values += ` # {${labels}} ${getValueAsString(val.exemplar.value)} ${
						val.exemplar.timestamp
					}`;
				} else {
					values += ` # {} ${getValueAsString(val.exemplar.value)} ${
						val.exemplar.timestamp
					}`;
				}
			}
			values += '\n';
		}

		return values;
	}

	async getMetricsAsString(metrics) {
		const metric = await metrics.get();

		const name = escapeString(metric.name);
		const help = `# HELP ${name} ${escapeString(metric.help)}`;
		const type = `# TYPE ${name} ${metric.type}`;
		const values = this.getLabelSetAsString(metric);

		return `${help}\n${type}\n${values}`.trim();
	}

	async metrics() {
		const promises = [];

		for (const metric of this.getMetricsAsArray()) {
			if (
				this.contentType === Registry.OPENMETRICS_CONTENT_TYPE &&
				metric.type === 'counter'
			) {
				metric.name = standardizeCounterName(metric.name);
			}
			promises.push(this.getMetricsAsString(metric));
		}

		const resolves = await Promise.all(promises);

		if (this.contentType === Registry.OPENMETRICS_CONTENT_TYPE) {
			return `${resolves.join('\n')}\n# EOF\n`;
		} else {
			return `${resolves.join('\n\n')}\n`;
		}
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
		return this.getMetricsAsString(this._metrics[name]);
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
		return this._contentType;
	}

	setContentType(metricsContentType) {
		if (
			metricsContentType === Registry.OPENMETRICS_CONTENT_TYPE ||
			metricsContentType === Registry.PROMETHEUS_CONTENT_TYPE
		) {
			this._contentType = metricsContentType;
		} else {
			throw new Error('Content type unsupported');
		}
	}

	static merge(registers) {
		const regType = registers[0].contentType;
		for (const reg of registers) {
			if (reg.contentType !== regType) {
				throw new Error(
					'Registers can only be merged if they have the same content type',
				);
			}
		}
		const mergedRegistry = new Registry(regType);

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

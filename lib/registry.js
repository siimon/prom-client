'use strict';

const { getValueAsString } = require('./util');

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
			throw new TypeError(`Content type ${regContentType} is unsupported`);
		}
		this._contentType = regContentType;
	}

	getMetricsAsArray() {
		return Object.values(this._metrics);
	}

	async getMetricsAsString(metrics) {
		const defaultLabels =
			Object.keys(this._defaultLabels).length > 0 ? this._defaultLabels : null;

		const formatValueGenerator = getValueAsPrometheusString(
			defaultLabels,
			this.contentType,
		);

		const metric = await metrics.get(formatValueGenerator);

		const name = escapeString(metric.name);
		const help = `# HELP ${name} ${escapeString(metric.help)}`;
		const type = `# TYPE ${name} ${metric.type}`;
		let values = [help, type];

		if (metric.values) {
			const formatValue = formatValueGenerator(metric.name, metric.type);
			values = metric.values.reduce((acc, value) => {
				acc.push(typeof value === 'string' ? value : formatValue(value));

				const { exemplar } = value;
				if (
					exemplar &&
					this.contentType === Registry.OPENMETRICS_CONTENT_TYPE
				) {
					const formattedExemplars = formatLabels(exemplar.labelSet);
					acc.push(
						` # {${formattedExemplars.join(',')}} ${getValueAsString(
							exemplar.value,
						)} ${exemplar.timestamp}`,
					);
				}

				return acc;
			}, values);
		}

		return values.join('\n');
	}

	async metrics() {
		const promises = this.getMetricsAsArray().map(metric => {
			if (
				this.contentType === Registry.OPENMETRICS_CONTENT_TYPE &&
				metric.type === 'counter'
			) {
				metric.name = standardizeCounterName(metric.name);
			}
			return this.getMetricsAsString(metric);
		});

		const resolves = await Promise.all(promises);

		return this.contentType === Registry.OPENMETRICS_CONTENT_TYPE
			? `${resolves.join('\n')}\n# EOF\n`
			: `${resolves.join('\n\n')}\n`;
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
		const promises = this.getMetricsAsArray().map(metric => metric.get());
		const resolves = await Promise.all(promises);

		const defaultLabelNames = Object.keys(this._defaultLabels);
		if (defaultLabelNames.length === 0) {
			return resolves;
		}

		return resolves.map(item => {
			if (item.values) {
				for (const val of item.values) {
					val.labels = { ...val.labels, ...this._defaultLabels, ...val.labels };
				}
			}
			return item;
		});
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
			throw new Error(`Content type ${metricsContentType} is unsupported`);
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

function getValueAsPrometheusString(defaultLabels, contentType) {
	return (name, type) => {
		const defaultName = escapeString(name);
		return ({ metricName = defaultName, value, labels = {} }) => {
			if (
				contentType === Registry.OPENMETRICS_CONTENT_TYPE &&
				type === 'counter'
			) {
				metricName = `${metricName}_total`;
			}

			if (defaultLabels) {
				labels = { ...labels, ...defaultLabels, ...labels };
			}

			const formattedLabels = formatLabels(labels);
			const labelsString = formattedLabels.length
				? `{${formattedLabels.join(',')}}`
				: '';

			return `${metricName}${labelsString} ${getValueAsString(value)}`;
		};
	};
}

function formatLabels(labels) {
	return Object.entries(labels).map(
		([n, v]) => `${n}="${escapeLabelValue(v)}"`,
	);
}

function escapeLabelValue(str) {
	if (typeof str !== 'string') {
		return str;
	}
	return escapeString(str).replace(/"/g, '\\"');
}
function escapeString(str) {
	return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}
function standardizeCounterName(name) {
	return name.replace(/_total$/, '');
}

module.exports = Registry;
module.exports.globalRegistry = new Registry();

'use strict';

const { getValueAsString, escapeLabelValue } = require('./util');
const { getFormatter } = require('./formatter');

module.exports = class Metric {
	constructor(config, type) {
		this.config = config;
		this.type = type;
		this.name = config.name;
		this.help = config.help;
		this.labelNames = this.config.labelNames || [];
		this.aggregator = this.config.aggregator || 'sum';

		this.config.registers.forEach(registryInstance =>
			registryInstance.registerMetric(this)
		);
	}

	getPrometheusString(timestamps, defaultLabels) {
		const item = this.get();
		if (!this.formatter) {
			this.formatter = getFormatter(this, defaultLabels);
		}
		return this.formatter(item, escapeLabelValue, getValueAsString, timestamps);
	}
};

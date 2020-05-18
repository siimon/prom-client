'use strict';

const { globalRegistry } = require('./registry');
const { isObject, getValueAsString, escapeLabelValue } = require('./util');
const { getFormatter } = require('./formatter');
const { validateMetricName, validateLabelName } = require('./validation');

/**
 * @abstract
 */
class Metric {
	constructor(config, defaults = {}) {
		if (!isObject(config)) {
			throw new TypeError('constructor expected a config object');
		}
		Object.assign(
			this,
			{
				labelNames: [],
				registers: [globalRegistry],
				aggregator: 'sum',
			},
			defaults,
			config,
		);
		if (!this.registers) {
			// in case config.registers is `undefined`
			this.registers = [globalRegistry];
		}
		if (!this.help) {
			throw new Error('Missing mandatory help parameter');
		}
		if (!this.name) {
			throw new Error('Missing mandatory name parameter');
		}
		if (!validateMetricName(this.name)) {
			throw new Error('Invalid metric name');
		}
		if (!validateLabelName(this.labelNames)) {
			throw new Error('Invalid label name');
		}

		this.reset();

		for (const register of this.registers) {
			register.registerMetric(this);
		}
	}

	getPrometheusString(defaultLabels) {
		const item = this.get();
		if (!this.formatter) {
			this.formatter = getFormatter(this, defaultLabels);
		}
		return this.formatter(item, escapeLabelValue, getValueAsString);
	}

	reset() {
		/* abstract */
	}
}

module.exports = { Metric };

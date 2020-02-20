/**
 * Counter metric
 */
'use strict';

const util = require('util');
const { globalRegistry } = require('./registry');
const type = 'counter';
const {
	getPropertiesFromObj,
	hashObject,
	isObject,
	getLabels,
	removeLabels
} = require('./util');

const {
	validateLabel,
	validateMetricName,
	validateLabelName
} = require('./validation');

class Counter {
	/**
	 * Counter
	 * @param {config} config - Configuration object.
	 * @param {string} config.name - Name of the metric
	 * @param {string} config.help - Help description for the metric
	 * @param {Array.<string>} config.labels - Array with strings, all label keywords supported
	 */
	constructor(config) {
		if (!isObject(config)) {
			throw new TypeError('constructor expected a config object');
		}
		config = Object.assign(
			{
				labelNames: []
			},
			config
		);
		if (!config.registers) {
			config.registers = [globalRegistry];
		}
		if (!config.help) {
			throw new Error('Missing mandatory help parameter');
		}
		if (!config.name) {
			throw new Error('Missing mandatory name parameter');
		}
		if (!validateMetricName(config.name)) {
			throw new Error('Invalid metric name');
		}
		if (!validateLabelName(config.labelNames)) {
			throw new Error('Invalid label name');
		}

		this.name = config.name;
		this.labelNames = config.labelNames || [];
		this.reset();
		this.help = config.help;
		this.aggregator = config.aggregator || 'sum';

		config.registers.forEach(registryInstance =>
			registryInstance.registerMetric(this)
		);
	}

	/**
	 * Increment counter
	 * @param {object} labels - What label you want to be incremented
	 * @param {Number} value - Value to increment, if omitted increment with 1
	 * @returns {void}
	 */
	inc(labels, value) {
		if (!isObject(labels)) {
			return inc.call(this, null)(labels, value);
		}

		const hash = hashObject(labels);
		return inc.call(this, labels, hash)(value);
	}

	/**
	 * Reset counter
	 * @returns {void}
	 */
	reset() {
		return reset.call(this);
	}

	get() {
		return {
			help: this.help,
			name: this.name,
			type,
			values: getPropertiesFromObj(this.hashMap),
			aggregator: this.aggregator
		};
	}

	labels() {
		const labels = getLabels(this.labelNames, arguments) || {};
		const hash = hashObject(labels);
		validateLabel(this.labelNames, labels);
		return {
			inc: inc.call(this, labels, hash)
		};
	}

	remove() {
		const labels = getLabels(this.labelNames, arguments) || {};
		return removeLabels.call(this, this.hashMap, labels);
	}
}

const reset = function() {
	this.hashMap = {};

	if (this.labelNames.length === 0) {
		this.hashMap = setValue({}, 0);
	}
};

const inc = function(labels, hash) {
	return value => {
		if (value && !Number.isFinite(value)) {
			throw new TypeError(`Value is not a valid number: ${util.format(value)}`);
		}
		if (value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		labels = labels || {};
		validateLabel(this.labelNames, labels);

		const incValue = value === null || value === undefined ? 1 : value;

		this.hashMap = setValue(this.hashMap, incValue, labels, hash);
	};
};

function setValue(hashMap, value, labels, hash) {
	hash = hash || '';
	if (hashMap[hash]) {
		hashMap[hash].value += value;
	} else {
		hashMap[hash] = { value, labels: labels || {} };
	}
	return hashMap;
}

module.exports = Counter;

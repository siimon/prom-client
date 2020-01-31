/**
 * Counter metric
 */
'use strict';

const util = require('util');
const { globalRegistry } = require('./registry');
const type = 'counter';
const {
	isDate,
	getPropertiesFromObj,
	hashObject,
	isObject,
	printDeprecationObjectConstructor,
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
	 * @param {string} name - Name of the metric
	 * @param {string} help - Help description for the metric
	 * @param {Array.<string>} labels - Labels
	 */
	constructor(name, help, labels) {
		let config;
		if (isObject(name)) {
			config = Object.assign(
				{
					labelNames: []
				},
				name
			);

			if (!config.registers) {
				config.registers = [globalRegistry];
			}
		} else {
			printDeprecationObjectConstructor();

			config = {
				name,
				help,
				labelNames: labels,
				registers: [globalRegistry]
			};
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
	 * @param {(Number|Date)} timestamp - Timestamp to set the counter to
	 * @returns {void}
	 */
	inc(labels, value, timestamp) {
		if (!isObject(labels)) {
			return inc.call(this, null)(labels, value);
		}

		const hash = hashObject(labels);
		return inc.call(this, labels, hash)(value, timestamp);
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
	return (value, timestamp) => {
		if (value && !Number.isFinite(value)) {
			throw new TypeError(`Value is not a valid number: ${util.format(value)}`);
		}
		if (timestamp && !isDate(timestamp) && !Number.isFinite(timestamp)) {
			throw new TypeError(
				`Timestamp is not a valid date or number: ${util.format(timestamp)}`
			);
		}
		if (value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		labels = labels || {};
		validateLabel(this.labelNames, labels);

		const incValue = value === null || value === undefined ? 1 : value;

		this.hashMap = setValue(this.hashMap, incValue, timestamp, labels, hash);
	};
};

function setValue(hashMap, value, timestamp, labels, hash) {
	hash = hash || '';
	timestamp = isDate(timestamp)
		? timestamp.valueOf()
		: Number.isFinite(timestamp)
		? timestamp
		: undefined;
	if (hashMap[hash]) {
		hashMap[hash].value += value;
		hashMap[hash].timestamp = timestamp;
	} else {
		hashMap[hash] = { value, labels: labels || {}, timestamp };
	}
	return hashMap;
}

module.exports = Counter;

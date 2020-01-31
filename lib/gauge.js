/**
 * Gauge metric
 */
'use strict';

const util = require('util');
const { globalRegistry } = require('./registry');
const type = 'gauge';

const {
	isDate,
	setValue,
	getPropertiesFromObj,
	getLabels,
	hashObject,
	isObject,
	printDeprecationObjectConstructor,
	removeLabels
} = require('./util');
const {
	validateMetricName,
	validateLabel,
	validateLabelName
} = require('./validation');

class Gauge {
	/**
	 * Gauge
	 * @param {string} name - Name of the metric
	 * @param {string} help - Help for the metric
	 * @param {Array.<string>} labels - Array with strings, all label keywords supported
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
	 * Set a gauge to a value
	 * @param {object} labels - Object with labels and their values
	 * @param {Number} value - Value to set the gauge to, must be positive
	 * @param {(Number|Date)} timestamp - Timestamp to set the gauge to
	 * @returns {void}
	 */
	set(labels, value, timestamp) {
		if (!isObject(labels)) {
			return set.call(this, null)(labels, value);
		}
		return set.call(this, labels)(value, timestamp);
	}

	/**
	 * Reset gauge
	 * @returns {void}
	 */
	reset() {
		return reset.call(this);
	}

	/**
	 * Increment a gauge value
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @param {Number} value - Value to increment - if omitted, increment with 1
	 * @param {(Number|Date)} timestamp - Timestamp to set the gauge to
	 * @returns {void}
	 */
	inc(labels, value, timestamp) {
		inc.call(this, labels)(value, timestamp);
	}

	/**
	 * Decrement a gauge value
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @param {Number} value - Value to decrement - if omitted, decrement with 1
	 * @param {(Number|Date)} timestamp - Timestamp to set the gauge to
	 * @returns {void}
	 */
	dec(labels, value, timestamp) {
		dec.call(this, labels)(value, timestamp);
	}

	/**
	 * Set the gauge to current unix epoch
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @returns {void}
	 */
	setToCurrentTime(labels) {
		return setToCurrentTime.call(this, labels)();
	}

	/**
	 * Start a timer
	 * @param {object} labels - Object with labels where key is the label key and value is label value. Can only be one level deep
	 * @returns {function} - Invoke this function to set the duration in seconds since you started the timer.
	 * @example
	 * var done = gauge.startTimer();
	 * makeXHRRequest(function(err, response) {
	 *	done(); //Duration of the request will be saved
	 * });
	 */
	startTimer(labels) {
		return startTimer.call(this, labels)();
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

	_getValue(labels) {
		const hash = hashObject(labels || {});
		return this.hashMap[hash] ? this.hashMap[hash].value : 0;
	}

	labels() {
		const labels = getLabels(this.labelNames, arguments);
		return {
			inc: inc.call(this, labels),
			dec: dec.call(this, labels),
			set: set.call(this, labels),
			setToCurrentTime: setToCurrentTime.call(this, labels),
			startTimer: startTimer.call(this, labels)
		};
	}

	remove() {
		const labels = getLabels(this.labelNames, arguments);
		removeLabels.call(this, this.hashMap, labels);
	}
}

function setToCurrentTime(labels) {
	return () => {
		const now = Date.now() / 1000;
		if (labels === undefined) {
			this.set(now);
		} else {
			this.set(labels, now);
		}
	};
}

function startTimer(startLabels) {
	return () => {
		const start = process.hrtime();
		return endLabels => {
			const delta = process.hrtime(start);
			this.set(
				Object.assign({}, startLabels, endLabels),
				delta[0] + delta[1] / 1e9
			);
		};
	};
}

function dec(labels) {
	return (value, timestamp) => {
		const data = convertLabelsAndValues(labels, value);
		this.set(
			data.labels,
			this._getValue(data.labels) - (data.value || 1),
			timestamp
		);
	};
}

function inc(labels) {
	return (value, timestamp) => {
		const data = convertLabelsAndValues(labels, value);
		this.set(
			data.labels,
			this._getValue(data.labels) + (data.value || 1),
			timestamp
		);
	};
}

function set(labels) {
	return (value, timestamp) => {
		if (typeof value !== 'number') {
			throw new TypeError(`Value is not a valid number: ${util.format(value)}`);
		}
		if (timestamp && !isDate(timestamp) && !Number.isFinite(timestamp)) {
			throw new TypeError(
				`Timestamp is not a valid date or number: ${util.format(timestamp)}`
			);
		}

		labels = labels || {};

		validateLabel(this.labelNames, labels);
		this.hashMap = setValue(this.hashMap, value, labels, timestamp);
	};
}

function reset() {
	this.hashMap = {};

	if (this.labelNames.length === 0) {
		this.hashMap = setValue({}, 0, {});
	}
}

function convertLabelsAndValues(labels, value) {
	if (!isObject(labels)) {
		return {
			value: labels,
			labels: {}
		};
	}
	return {
		labels,
		value
	};
}

module.exports = Gauge;

/**
 * Counter metric
 */
'use strict';
const globalRegistry = require('./register');
const type = 'counter';
const isNumber = require('./util').isNumber;
const isDate = require('./util').isDate;
const getProperties = require('./util').getPropertiesFromObj;
const hashObject = require('./util').hashObject;
const validateLabels = require('./validation').validateLabel;
const validateMetricName = require('./validation').validateMetricName;
const validateLabelNames = require('./validation').validateLabelName;
const isObject = require('./util').isObject;

const getLabels = require('./util').getLabels;

/**
 * Counter
 * @param {string} name - Name of the metric
 * @param {string} help - Help description for the metric
 * @param {Array.<string>} labels - Labels
 * @constructor
 */
function Counter(name, help, labels) {
	let config;
	if (isObject(name)) {
		config = Object.assign(
			{
				labelNames: [],
				registers: [globalRegistry]
			},
			name
		);
	} else {
		//Backwards compability - will be depricated
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

	if (!validateLabelNames(config.labelNames)) {
		throw new Error('Invalid label name');
	}

	this.name = name;
	this.name = config.name;
	this.hashMap = {};

	this.labelNames = config.labelNames || [];

	this.help = config.help;

	const metric = this;
	config.registers.forEach(function(registryInstance) {
		registryInstance.registerMetric(metric);
	});
}

/**
 * Increment counter
 * @param {object} labels - What label you want to be incremented
 * @param {Number} value - Value to increment, if omitted increment with 1
 * @param {(Number|Date)} timestamp - Timestamp to set the counter to
 * @returns {void}
 */
Counter.prototype.inc = function(labels, value, timestamp) {
	if (isNumber(labels) || !labels) {
		return inc.call(this, null)(labels, value);
	}

	const hash = hashObject(labels);
	return inc.call(this, labels, hash)(value, timestamp);
};

Counter.prototype.get = function() {
	return {
		help: this.help,
		name: this.name,
		type,
		values: getProperties(this.hashMap)
	};
};

Counter.prototype.labels = function() {
	const labels = getLabels(this.labelNames, arguments) || {};
	const hash = hashObject(labels);
	validateLabels(this.labelNames, labels);
	return {
		inc: inc.call(this, labels, hash)
	};
};

const inc = function(labels, hash) {
	const that = this;
	return function(value, timestamp) {
		if (value && !isNumber(value)) {
			throw new Error('Value is not a valid number', value);
		}
		if (timestamp && !isDate(timestamp) && !isNumber(timestamp)) {
			throw new Error('Timestamp is not a valid date or number', value);
		}
		if (value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		const incValue = value === null || value === undefined ? 1 : value;

		that.hashMap = createValue(that.hashMap, incValue, timestamp, labels, hash);
	};
};

function createValue(hashMap, value, timestamp, labels, hash) {
	timestamp = isDate(timestamp)
		? timestamp.valueOf()
		: isNumber(timestamp) ? timestamp : undefined;
	if (hashMap[hash]) {
		hashMap[hash].value += value;
		hashMap[hash].timestamp = timestamp;
	} else {
		hashMap[hash] = { value, labels: labels || {}, timestamp };
	}
	return hashMap;
}

module.exports = Counter;

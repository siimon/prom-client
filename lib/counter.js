/**
 * Counter metric
 */
'use strict';

const util = require('util');
const type = 'counter';
const { hashObject, isObject, getLabels, removeLabels } = require('./util');
const { validateLabel } = require('./validation');
const { Metric } = require('./metric');

class Counter extends Metric {
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
			values: Object.values(this.hashMap),
			aggregator: this.aggregator,
		};
	}

	labels() {
		const labels = getLabels([...this.labelNames], arguments) || {};
		const hash = hashObject(labels);
		return {
			inc: inc.call(this, labels, hash),
		};
	}

	remove() {
		const labels = getLabels([...this.labelNames], arguments) || {};
		return removeLabels.call(this, this.hashMap, labels);
	}
}

const reset = function () {
	this.hashMap = {};

	if (this.labelNames.size === 0) {
		this.hashMap = setValue({}, 0);
	}
};

const inc = function (labels, hash) {
	return value => {
		if (value && !Number.isFinite(value)) {
			throw new TypeError(`Value is not a valid number: ${util.format(value)}`);
		}
		if (value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		// if strictLabelNames, verify that no new labels are added, and if not,
		// then simply add any labels appearing for the first time to the set
		// of labelnames on this metric
		if (this.strictLabelNames) {
			validateLabel([...this.labelNames], labels);
		} else {
			// adding to Set is idempotent, so simply add all
			for (const labelName in labels) {
				this.labelNames.add(labelName);
			}
		}
		labels = labels || {};

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

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
		let hash;
		if (isObject(labels)) {
			hash = hashObject(labels);
			validateLabel(this.labelNames, labels);
		} else {
			value = labels;
			labels = {};
		}

		if (value && !Number.isFinite(value)) {
			throw new TypeError(`Value is not a valid number: ${util.format(value)}`);
		}
		if (value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		if (value === null || value === undefined) value = 1;

		setValue(this.hashMap, value, labels, hash);
	}

	/**
	 * Reset counter
	 * @returns {void}
	 */
	reset() {
		this.hashMap = {};
		if (this.labelNames.length === 0) {
			setValue(this.hashMap, 0);
		}
	}

	async get() {
		if (this.collect) {
			const v = this.collect();
			if (v instanceof Promise) await v;
		}
		return {
			help: this.help,
			name: this.name,
			type,
			values: Object.values(this.hashMap),
			aggregator: this.aggregator,
		};
	}

	labels(...args) {
		const labels = getLabels(this.labelNames, args) || {};
		return {
			inc: this.inc.bind(this, labels),
		};
	}

	remove(...args) {
		const labels = getLabels(this.labelNames, args) || {};
		validateLabel(this.labelNames, labels);
		return removeLabels.call(this, this.hashMap, labels);
	}
}

function setValue(hashMap, value, labels = {}, hash = '') {
	if (hashMap[hash]) {
		hashMap[hash].value += value;
	} else {
		hashMap[hash] = { value, labels };
	}
	return hashMap;
}

module.exports = Counter;

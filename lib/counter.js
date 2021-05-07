/**
 * Counter metric
 */
'use strict';

const util = require('util');
const type = 'counter';
const { hashObject, isObject, getLabels, removeLabels } = require('./util');
const { validateLabel, validateExemplar } = require('./validation');
const { Metric } = require('./metric');

class Counter extends Metric {
	/**
	 * Increment counter
	 * @param {object} labels - What label you want to be incremented
	 * @param {Number} value - Value to increment, if omitted increment with 1
	 * @param {object} exemplars - What exemplars you want to pass to this metric
	 * @param {Number} exemplarValue - Value to be set as the exemplar value
	 * @returns {void}
	 */
	inc(labels, value, exemplars, exemplarValue) {
		if (!isObject(labels)) {
			return inc.call(this, null, exemplars)(labels, value, exemplars);
		}

		const hash = hashObject(labels, exemplars);
		return inc.call(this, labels, exemplars, hash, exemplarValue)(value);
	}

	/**
	 * Reset counter
	 * @returns {void}
	 */
	reset() {
		return reset.call(this);
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

	labels() {
		const labels = getLabels(this.labelNames, arguments) || {};
		validateLabel(this.labelNames, labels);
		const hash = hashObject(labels, {});
		return {
			inc: inc.call(this, labels, null, hash),
		};
	}

	exemplars() {
		const exemplars = getLabels(this.exemplarNames, arguments) || {};
		const exemplarValue = this.exemplarValue || 1;
		validateExemplar(this.exemplarNames, exemplars, exemplarValue);
		const hash = hashObject({}, exemplars);
		return {
			inc: inc.call(this, null, exemplars, hash, exemplarValue),
		};
	}

	remove() {
		const labels = getLabels(this.labelNames, arguments) || {};
		validateLabel(this.labelNames, labels);
		return removeLabels.call(this, this.hashMap, labels);
	}
}

const reset = function () {
	this.hashMap = {};

	if (this.labelNames.length === 0) {
		this.hashMap = setValue({}, 0);
	}
};

const inc = function (labels, exemplars, hash, exemplarValue) {
	return value => {
		if (value && !Number.isFinite(value)) {
			throw new TypeError(`Value is not a valid number: ${util.format(value)}`);
		}
		if (exemplarValue && !Number.isFinite(exemplarValue)) {
			throw new TypeError(
				`Exemplar value is not a valid number: ${util.format(exemplarValue)}`,
			);
		}
		if (value < 0) {
			throw new Error('It is not possible to decrease a counter');
		}

		labels = labels || {};
		exemplars = exemplars || {};
		validateLabel(this.labelNames, labels);
		validateExemplar(this.exemplarNames, exemplars, exemplarValue);

		const incValue = value === null || value === undefined ? 1 : value;

		this.hashMap = setValue(
			this.hashMap,
			incValue,
			exemplarValue,
			labels,
			exemplars,
			hash,
		);
	};
};

function setValue(hashMap, value, exemplarValue, labels, exemplars, hash) {
	hash = hash || '';
	if (hashMap[hash]) {
		hashMap[hash].value += value;
	} else {
		hashMap[hash] = exemplarValue
			? { value, labels: labels || {}, exemplars, exemplarValue }
			: { value, labels: labels || {} };
	}
	return hashMap;
}

module.exports = Counter;

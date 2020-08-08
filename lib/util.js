'use strict';

exports.getValueAsString = function getValueString(value) {
	if (Number.isNaN(value)) {
		return 'Nan';
	} else if (!Number.isFinite(value)) {
		if (value < 0) {
			return '-Inf';
		} else {
			return '+Inf';
		}
	} else {
		return `${value}`;
	}
};

exports.removeLabels = function removeLabels(hashMap, labels) {
	const hash = hashObject(labels);
	delete hashMap[hash];
};

exports.setValue = function setValue(hashMap, value, labels) {
	const hash = hashObject(labels);
	hashMap[hash] = {
		value: typeof value === 'number' ? value : 0,
		labels: labels || {},
	};
	return hashMap;
};

// TODO: For node 6, use rest params
exports.getLabels = function (labelNames, args) {
	if (typeof args[0] === 'object') {
		return args[0];
	}

	if (labelNames.length !== args.length) {
		throw new Error('Invalid number of arguments');
	}

	const argsAsArray = Array.prototype.slice.call(args);
	return labelNames.reduce((acc, label, index) => {
		acc[label] = argsAsArray[index];
		return acc;
	}, {});
};

function hashObject(labels) {
	// We don't actually need a hash here. We just need a string that
	// is unique for each possible labels object and consistent across
	// calls with equivalent labels objects.
	let keys = Object.keys(labels);
	if (keys.length === 0) {
		return '';
	}
	// else
	if (keys.length > 1) {
		keys = keys.sort(); // need consistency across calls
	}

	let hash = '';
	let i = 0;
	const size = keys.length;
	for (; i < size - 1; i++) {
		hash += `${keys[i]}:${labels[keys[i]]},`;
	}
	hash += `${keys[i]}:${labels[keys[i]]}`;
	return hash;
}
exports.hashObject = hashObject;

exports.isObject = function isObject(obj) {
	return obj === Object(obj);
};

class Grouper extends Map {
	/**
	 * Adds the `value` to the `key`'s array of values.
	 * @param {*} key Key to set.
	 * @param {*} value Value to add to `key`'s array.
	 * @returns {undefined} undefined.
	 */
	add(key, value) {
		if (this.has(key)) {
			this.get(key).push(value);
		} else {
			this.set(key, [value]);
		}
	}
}

exports.Grouper = Grouper;

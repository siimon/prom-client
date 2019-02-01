'use strict';

const deprecationsEmitted = {};

exports.isDate = isDate;

exports.getPropertiesFromObj = function(hashMap) {
	const obj = Object.keys(hashMap).map(x => hashMap[x]);
	return obj;
};

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

exports.setValue = function setValue(hashMap, value, labels, timestamp) {
	const hash = hashObject(labels);
	hashMap[hash] = {
		value: typeof value === 'number' ? value : 0,
		labels: labels || {},
		timestamp: isDate(timestamp)
			? timestamp.valueOf()
			: Number.isFinite(timestamp)
			? timestamp
			: undefined
	};
	return hashMap;
};

// TODO: For node 6, use rest params
exports.getLabels = function(labelNames, args) {
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

function isDate(obj) {
	return obj instanceof Date && !isNaN(obj.valueOf());
}
exports.isObject = function isObject(obj) {
	return obj === Object(obj);
};

function printDeprecation(msg) {
	if (deprecationsEmitted[msg]) {
		return;
	}

	deprecationsEmitted[msg] = true;

	if (process.emitWarning) {
		process.emitWarning(msg, 'DeprecationWarning');
	} else {
		// Check can be removed when we only support node@>=6
		// eslint-disable-next-line no-console
		console.warn(new Error(msg));
	}
}

exports.printDeprecationObjectConstructor = () => {
	printDeprecation(
		'prom-client - Passing a non-object to metrics constructor is deprecated'
	);
};

exports.printDeprecationCollectDefaultMetricsNumber = timeout => {
	printDeprecation(
		`prom-client - A number to defaultMetrics is deprecated, please use \`collectDefaultMetrics({ timeout: ${timeout} })\`.`
	);
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

'use strict';

exports.isNumber = isNumber;

exports.getPropertiesFromObj = function(hashMap) {
	var obj = Object.keys(hashMap).map(function(x) {
		return hashMap[x];
	});
	return obj;
};

exports.incValue = function createValue(hashMap, value, labels, hash) {
	if(hashMap[hash]) {
		hashMap[hash].value += value || 1;
	} else {
		hashMap[hash] = { value: value || 1, labels: labels || {} };
	}
	return hashMap;
};

exports.setValue = function setValue(hashMap, value, labels) {
	var hash = hashObject(labels);
	hashMap[hash] = { value: isNumber(value) ? value : 0, labels: labels || {} };
	return hashMap;
};

exports.getLabels = function(labelNames, args) {
	if(labelNames.length !== args.length) {
		throw new Error('Invalid number of arguments');
	}

	var argsAsArray = Array.prototype.slice.call(args);
	return labelNames.reduce(function(acc, label, index) {
		acc[label] = argsAsArray[index];
		return acc;
	}, {});
};


function hashObject(labels) {
	// We don't actually need a hash here. We just need a string that
	// is unique for each possible labels object and consistent across
	// calls with equivalent labels objects.
	var keys = Object.keys(labels);
	if(keys.length === 0) {
		return '';
	}
	// else
	if(keys.length > 1) {
		keys = keys.sort();		// need consistency across calls
	}

	var elems = [];
	for(var i = 0; i < keys.length; i++) {
		elems.push(keys[i] + ':' + labels[keys[i]]);
	}
	return elems.join(',');
}
exports.hashObject = hashObject;

function isNumber(obj) {
	return !isNaN(parseFloat(obj));
}

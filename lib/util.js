'use strict';

var objectHash = require('object-hash');
exports.isNumber = isNumber;

exports.getPropertiesFromObj = function(hashMap) {
	var obj = Object.keys(hashMap).map(function(x) {
		return hashMap[x];
	});
	return obj;
};

exports.incValue = function createValue(hashMap, value, labels) {
	var hash = hashObject(labels);
	if(hashMap[hash]){
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
	return labelNames.reduce(function(acc, label, index){
		acc[label] = argsAsArray[index];
		return acc;
	}, {});
};


function hashObject(labels) {
	return objectHash(labels);
}

function isNumber(obj) { return !isNaN(parseFloat(obj)); };

'use strict';

var objectHash = require('object-hash');
exports.isNumber = function isNumber(obj) { return !isNaN(parseFloat(obj)); };

exports.getPropertiesFromObj = function(hashMap) {
	var obj = Object.keys(hashMap).map(function(x) {
		return hashMap[x];
	});
	return obj;
};

exports.createValue = function createValue(hashMap, value, labels) {
	var hash = objectHash(labels);
	if(hashMap[hash]){
		hashMap[hash].value += value || 1;
	} else {
		hashMap[hash] = { value: value || 1, labels: labels || {} };
	}
	return hashMap;
};

exports.validateLabel = function validateLabel(savedLabels, labels) {
	Object.keys(labels).forEach(function(label) {
		if(savedLabels.indexOf(label) === -1) {
			throw new Error('Added label is not included in initial labelset');
		}
	});
};

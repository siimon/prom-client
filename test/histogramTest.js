'use strict';

describe.only('histogram', function() {
	var Histogram = require('../lib/histogram');
	var expect = require('chai').expect;
	var instance;
	beforeEach(function() {
		instance = new Histogram({ name: 'test_histogram'});
	});

	it('should increase count', function() {
		instance.observe(0.5);
		var valuePair = getValueByName('test_histogram_count', instance.get().values);
		expect(valuePair.value).to.equal(1);
	});
	it('should increase sum', function() {
		instance.observe(0.5);
		var valuePair = getValueByName('test_histogram_sum', instance.get().values);
		expect(valuePair.value).to.equal(0.5);
	});
	it('should add item in upper bound bucket', function() {
		instance.observe(1);
		var valuePair = getValueByLabel(1, instance.get().values);
		expect(valuePair.value).to.equal(1);
	});

	it('should be able to monitor more than one item', function() {
		instance.observe(0.05);
		instance.observe(5);
		var firstValuePair = getValueByLabel(0.05, instance.get().values); 
		var secondValuePair = getValueByLabel(5, instance.get().values); 
		expect(firstValuePair.value).to.equal(1);
		expect(secondValuePair.value).to.equal(1);
	});

	function getValueByName(name, values) {
		return values.reduce(function(acc, val) {
			if(val.metricName === name) {
				acc = val;
			}
			return acc;
		});
	}
	function getValueByLabel(label, values) {
		return values.reduce(function(acc, val) {
			if(val.labels && val.labels.le === label) {
				acc = val;
			}
			return acc;
		}, {});
	}
});

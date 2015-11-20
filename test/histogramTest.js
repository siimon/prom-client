'use strict';

describe('histogram', function() {
	var Histogram = require('../lib/histogram');
	var sinon = require('sinon');
	var expect = require('chai').expect;
	var instance;
	beforeEach(function() {
		instance = new Histogram({ name: 'test_histogram'});
	});
	afterEach(function() {
		instance = null;
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
		var i = new Histogram({});
		i.observe(0.05);
		i.observe(5);
		var firstValuePair = getValueByLabel(0.05, i.get().values); 
		var secondValuePair = getValueByLabel(5, i.get().values); 
		expect(firstValuePair.value).to.equal(1);
		expect(secondValuePair.value).to.equal(1);
	});

	it('should add a +Inf bucket with the same value as count', function() {
		instance.observe(10);
		var countValuePair = getValueByName('test_histogram_count', instance.get().values);
		var infValuePair = getValueByLabel('+Inf', instance.get().values);
		expect(infValuePair.value).to.equal(countValuePair.value);
	});

	it('should add buckets in increasing numerical order', function() {
		var histogram = new Histogram({ buckets: [1, 5], name: 'histogram'});
		histogram.observe(1.5);
		var values = histogram.get().values;
		expect(values[0].labels.le).to.equal(1);
		expect(values[1].labels.le).to.equal(5);
		expect(values[2].labels.le).to.equal('+Inf');
	});

	it('should time requests', function() {
		var clock = sinon.useFakeTimers();
		var doneFn = instance.startTimer();
		clock.tick(500);
		doneFn();
		var valuePair = getValueByLabel(0.5, instance.get().values);
		expect(valuePair.value).to.equal(1);
		clock.restore();
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

'use strict';

describe('histogram', function() {
	var Histogram = require('../index').histogram;
	var sinon = require('sinon');
	var expect = require('chai').expect;
	var instance;
	beforeEach(function() {
		instance = new Histogram('test_histogram', 'test');
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
		instance.observe(0.05);
		instance.observe(5);
		var firstValuePair = getValueByLabel(0.05, instance.get().values);
		var secondValuePair = getValueByLabel(5, instance.get().values);
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
		var histogram = new Histogram('test_histogram', 'test', { buckets: [1, 5] });
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

	it('should not allow non numbers', function() {
		var fn = function() {
			instance.observe('asd');
		};
		expect(fn).to.throw(Error);
	});

	it('should allow custom labels', function() {
		var i = new Histogram('histo', 'help', { labels: { code: 'test' }});
		i.observe(1);
		var pair = getValueByLabel('test', instance.get().values);
		expect(pair).to.exist;
	});

	it('should not allow le as a custom label', function() {
		var fn = function() {
			new Histogram('name', 'help', { labels: { le: 'test' }});
		};
		expect(fn).to.throw(Error);
	});

	it('should not observe value if outside most upper bound', function() {
		instance.observe(100000);
		var values = instance.get().values;
		var valuesAboveZero = values.reduce(function(acc, v) {
			acc += v.value;
			return acc;
		}, 0);
		expect(valuesAboveZero).to.equal(0);
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

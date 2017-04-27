'use strict';

describe('histogram', function() {
	var Histogram = require('../index').Histogram;
	var Registry = require('../index').Registry;
	var register = require('../index').register;
	var sinon = require('sinon');
	var expect = require('chai').expect;
	var instance;
	describe('global registry', function() {
		beforeEach(function() {
			instance = new Histogram('test_histogram', 'test');
		});
		afterEach(function() {
			instance = null;
			register.clear();
		});

		it('should increase count', function() {
			instance.observe(0.5);
			var valuePair = getValueByName('test_histogram_count', instance.get().values);
			expect(valuePair.value).to.equal(1);
		});
		it('should be able to observe 0s', function() {
			instance.observe(0);
			var valuePair = getValueByLabel(0.005, instance.get().values);
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
			expect(secondValuePair.value).to.equal(2);
		});

		it('should add a +Inf bucket with the same value as count', function() {
			instance.observe(10);
			var countValuePair = getValueByName('test_histogram_count', instance.get().values);
			var infValuePair = getValueByLabel('+Inf', instance.get().values);
			expect(infValuePair.value).to.equal(countValuePair.value);
		});

		it('should add buckets in increasing numerical order', function() {
			var histogram = new Histogram('test_histogram_2', 'test', { buckets: [1, 5] });
			histogram.observe(1.5);
			var values = histogram.get().values;
			expect(values[0].labels.le).to.equal(1);
			expect(values[1].labels.le).to.equal(5);
			expect(values[2].labels.le).to.equal('+Inf');
		});
		it('should group counts on each label set', function() {
			var histogram = new Histogram('test_histogram_2', 'test', [ 'code' ]);
			histogram.observe({ code: '200' }, 1);
			histogram.observe({ code: '300' }, 1);
			var values = getValuesByLabel(1, histogram.get().values);
			expect(values[0].value).to.equal(1);
			expect(values[1].value).to.equal(1);
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
			var i = new Histogram('histo', 'help', [ 'code' ]);
			i.observe({ code: 'test'}, 1);
			var pair = getValueByLeAndLabel(1, 'code', 'test', i.get().values);
			expect(pair.value).to.equal(1);
		});

		it('should not allow le as a custom label', function() {
			var fn = function() {
				new Histogram('name', 'help', [ 'le' ]);
			};
			expect(fn).to.throw(Error);
		});

		it('should observe value if outside most upper bound', function() {
			instance.observe(100000);
			var values = instance.get().values;
			var count = getValueByLabel('+Inf', values, 'le');
			expect(count.value).to.equal(1);
		});

		it('should allow to be reset itself', function() {
			instance.observe(0.5);
			var valuePair = getValueByName('test_histogram_count', instance.get().values);
			expect(valuePair.value).to.equal(1);
			instance.reset();
			valuePair = getValueByName('test_histogram_count', instance.get().values);
			expect(valuePair.value).to.equal(undefined);
		});

		describe('labels', function() {
			beforeEach(function() {
				instance = new Histogram('histogram_labels', 'Histogram with labels fn', [ 'method' ]);
			});

			it('should observe', function() {
				instance.labels('get').observe(4);
				var res = getValueByLeAndLabel(5, 'method', 'get', instance.get().values);
				expect(res.value).to.equal(1);
			});

			it('should not allow different number of labels', function() {
				var fn = function() {
					instance.labels('get', '500').observe(4);
				};
				expect(fn).to.throw(Error);
			});

			it('should start a timer', function() {
				var clock = sinon.useFakeTimers();
				var end = instance.labels('get').startTimer();
				clock.tick(500);
				end();
				var res = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
				expect(res.value).to.equal(1);
				clock.restore();
			});

			it('should start a timer and set labels afterwards', function(){
				var clock = sinon.useFakeTimers();
				var end = instance.startTimer();
				clock.tick(500);
				end({ 'method': 'get' });
				var res = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
				expect(res.value).to.equal(1);
				clock.restore();
			});

			it('should allow labels before and after timers', function(){
				instance = new Histogram('histogram_labels_2', 'Histogram with labels fn', [ 'method', 'success' ]);
				var clock = sinon.useFakeTimers();
				var end = instance.startTimer({ 'method': 'get' });
				clock.tick(500);
				end({ 'success': 'SUCCESS' });
				var res1 = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
				var res2 = getValueByLeAndLabel(0.5, 'success', 'SUCCESS', instance.get().values);
				expect(res1.value).to.equal(1);
				expect(res2.value).to.equal(1);
				clock.restore();
			});
		});
	});
	describe('without registry', function() {
		beforeEach(function() {
			instance = new Histogram('test_histogram', 'test', null, null, false);
		});
		it('should increase count', function() {
			instance.observe(0.5);
			var valuePair = getValueByName('test_histogram_count', instance.get().values);
			expect(valuePair.value).to.equal(1);
			expect(register.getMetricsAsJSON().length).to.equal(0);
		});
	});
	describe('registry instance', function() {
		var registry;
		beforeEach(function() {
			registry = new Registry();
			instance = new Histogram('test_histogram', 'test', null, null, false);
			registry.registerMetric(instance);
		});
		it('should increment counter', function() {
			instance.observe(0.5);
			var valuePair = getValueByName('test_histogram_count', instance.get().values);
			expect(valuePair.value).to.equal(1);
			expect(register.getMetricsAsJSON().length).to.equal(0);
			expect(registry.getMetricsAsJSON().length).to.equal(1);
		});
	});

	function getValueByName(name, values) {
		return values.length > 0 && values.reduce(function(acc, val) {
			if(val.metricName === name) {
				acc = val;
			}
			return acc;
		});
	}
	function getValueByLeAndLabel(le, key, label, values) {
		return values.reduce(function(acc, val) {
			if(val.labels && val.labels.le === le && val.labels[key] === label) {
				acc = val;
			}
			return acc;
		}, {});
	}
	function getValueByLabel(label, values, key) {
		return values.reduce(function(acc, val) {
			if(val.labels && val.labels[key || 'le'] === label) {
				acc = val;
			}
			return acc;
		}, {});
	}
	function getValuesByLabel(label, values, key) {
		return values.reduce(function(acc, val) {
			if(val.labels && val.labels[key || 'le'] === label) {
				acc.push(val);
			}
			return acc;
		}, []);
	}
});

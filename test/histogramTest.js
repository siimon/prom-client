'use strict';

describe('histogram', function() {
	const Histogram = require('../index').Histogram;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	const sinon = require('sinon');
	const expect = require('chai').expect;
	let instance;

	afterEach(function() {
		instance = null;
		globalRegistry.clear();
	});

	describe('with a parameter for each variable', function() {
		beforeEach(function() {
			instance = new Histogram('test_histogram', 'test');
		});

		it('should increase count', function() {
			instance.observe(0.5);
			const valuePair = getValueByName('test_histogram_count', instance.get().values);
			expect(valuePair.value).to.equal(1);
		});
		it('should be able to observe 0s', function() {
			instance.observe(0);
			const valuePair = getValueByLabel(0.005, instance.get().values);
			expect(valuePair.value).to.equal(1);
		});
		it('should increase sum', function() {
			instance.observe(0.5);
			const valuePair = getValueByName('test_histogram_sum', instance.get().values);
			expect(valuePair.value).to.equal(0.5);
		});
		it('should add item in upper bound bucket', function() {
			instance.observe(1);
			const valuePair = getValueByLabel(1, instance.get().values);
			expect(valuePair.value).to.equal(1);
		});

		it('should be able to monitor more than one item', function() {
			instance.observe(0.05);
			instance.observe(5);
			const firstValuePair = getValueByLabel(0.05, instance.get().values);
			const secondValuePair = getValueByLabel(5, instance.get().values);
			expect(firstValuePair.value).to.equal(1);
			expect(secondValuePair.value).to.equal(2);
		});

		it('should add a +Inf bucket with the same value as count', function() {
			instance.observe(10);
			const countValuePair = getValueByName('test_histogram_count', instance.get().values);
			const infValuePair = getValueByLabel('+Inf', instance.get().values);
			expect(infValuePair.value).to.equal(countValuePair.value);
		});

		it('should add buckets in increasing numerical order', function() {
			const histogram = new Histogram('test_histogram_2', 'test', { buckets: [1, 5] });
			histogram.observe(1.5);
			const values = histogram.get().values;
			expect(values[0].labels.le).to.equal(1);
			expect(values[1].labels.le).to.equal(5);
			expect(values[2].labels.le).to.equal('+Inf');
		});
		it('should group counts on each label set', function() {
			const histogram = new Histogram('test_histogram_2', 'test', [ 'code' ]);
			histogram.observe({ code: '200' }, 1);
			histogram.observe({ code: '300' }, 1);
			const values = getValuesByLabel(1, histogram.get().values);
			expect(values[0].value).to.equal(1);
			expect(values[1].value).to.equal(1);
		});

		it('should time requests', function() {
			const clock = sinon.useFakeTimers();
			const doneFn = instance.startTimer();
			clock.tick(500);
			doneFn();
			const valuePair = getValueByLabel(0.5, instance.get().values);
			expect(valuePair.value).to.equal(1);
			clock.restore();
		});

		it('should not allow non numbers', function() {
			const fn = function() {
				instance.observe('asd');
			};
			expect(fn).to.throw(Error);
		});

		it('should allow custom labels', function() {
			const i = new Histogram('histo', 'help', [ 'code' ]);
			i.observe({ code: 'test'}, 1);
			const pair = getValueByLeAndLabel(1, 'code', 'test', i.get().values);
			expect(pair.value).to.equal(1);
		});

		it('should not allow le as a custom label', function() {
			const fn = function() {
				new Histogram('name', 'help', [ 'le' ]);
			};
			expect(fn).to.throw(Error);
		});

		it('should observe value if outside most upper bound', function() {
			instance.observe(100000);
			const values = instance.get().values;
			const count = getValueByLabel('+Inf', values, 'le');
			expect(count.value).to.equal(1);
		});

		it('should allow to be reset itself', function() {
			instance.observe(0.5);
			let valuePair = getValueByName('test_histogram_count', instance.get().values);
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
				const res = getValueByLeAndLabel(5, 'method', 'get', instance.get().values);
				expect(res.value).to.equal(1);
			});

			it('should not allow different number of labels', function() {
				const fn = function() {
					instance.labels('get', '500').observe(4);
				};
				expect(fn).to.throw(Error);
			});

			it('should start a timer', function() {
				const clock = sinon.useFakeTimers();
				const end = instance.labels('get').startTimer();
				clock.tick(500);
				end();
				const res = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
				expect(res.value).to.equal(1);
				clock.restore();
			});

			it('should start a timer and set labels afterwards', function(){
				const clock = sinon.useFakeTimers();
				const end = instance.startTimer();
				clock.tick(500);
				end({ 'method': 'get' });
				const res = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
				expect(res.value).to.equal(1);
				clock.restore();
			});

			it('should allow labels before and after timers', function(){
				instance = new Histogram('histogram_labels_2', 'Histogram with labels fn', [ 'method', 'success' ]);
				const clock = sinon.useFakeTimers();
				const end = instance.startTimer({ 'method': 'get' });
				clock.tick(500);
				end({ 'success': 'SUCCESS' });
				const res1 = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
				const res2 = getValueByLeAndLabel(0.5, 'success', 'SUCCESS', instance.get().values);
				expect(res1.value).to.equal(1);
				expect(res2.value).to.equal(1);
				clock.restore();
			});
		});
	});

	describe('with object as params', function() {
		describe('with global registry', function() {
			beforeEach(function() {
				instance = new Histogram({ name: 'test_histogram', help: 'test' });
			});

			it('should increase count', function() {
				instance.observe(0.5);
				const valuePair = getValueByName('test_histogram_count', instance.get().values);
				expect(valuePair.value).to.equal(1);
			});
			it('should be able to observe 0s', function() {
				instance.observe(0);
				const valuePair = getValueByLabel(0.005, instance.get().values);
				expect(valuePair.value).to.equal(1);
			});
			it('should increase sum', function() {
				instance.observe(0.5);
				const valuePair = getValueByName('test_histogram_sum', instance.get().values);
				expect(valuePair.value).to.equal(0.5);
			});
			it('should add item in upper bound bucket', function() {
				instance.observe(1);
				const valuePair = getValueByLabel(1, instance.get().values);
				expect(valuePair.value).to.equal(1);
			});

			it('should be able to monitor more than one item', function() {
				instance.observe(0.05);
				instance.observe(5);
				const firstValuePair = getValueByLabel(0.05, instance.get().values);
				const secondValuePair = getValueByLabel(5, instance.get().values);
				expect(firstValuePair.value).to.equal(1);
				expect(secondValuePair.value).to.equal(2);
			});

			it('should add a +Inf bucket with the same value as count', function() {
				instance.observe(10);
				const countValuePair = getValueByName('test_histogram_count', instance.get().values);
				const infValuePair = getValueByLabel('+Inf', instance.get().values);
				expect(infValuePair.value).to.equal(countValuePair.value);
			});

			it('should add buckets in increasing numerical order', function() {
				const histogram = new Histogram( { name :'test_histogram_2', help: 'test', buckets: [1, 5] });
				histogram.observe(1.5);
				const values = histogram.get().values;
				expect(values[0].labels.le).to.equal(1);
				expect(values[1].labels.le).to.equal(5);
				expect(values[2].labels.le).to.equal('+Inf');
			});
			it('should group counts on each label set', function() {
				const histogram = new Histogram({ name: 'test_histogram_2', help: 'test', labelNames: [ 'code' ] });
				histogram.observe({ code: '200' }, 1);
				histogram.observe({ code: '300' }, 1);
				const values = getValuesByLabel(1, histogram.get().values);
				expect(values[0].value).to.equal(1);
				expect(values[1].value).to.equal(1);
			});

			it('should time requests', function() {
				const clock = sinon.useFakeTimers();
				const doneFn = instance.startTimer();
				clock.tick(500);
				doneFn();
				const valuePair = getValueByLabel(0.5, instance.get().values);
				expect(valuePair.value).to.equal(1);
				clock.restore();
			});

			it('should not allow non numbers', function() {
				const fn = function() {
					instance.observe('asd');
				};
				expect(fn).to.throw(Error);
			});

			it('should allow custom labels', function() {
				const i = new Histogram({ name: 'histo', help: 'help', labelNames: [ 'code' ] });
				i.observe({ code: 'test'}, 1);
				const pair = getValueByLeAndLabel(1, 'code', 'test', i.get().values);
				expect(pair.value).to.equal(1);
			});

			it('should not allow le as a custom label', function() {
				const fn = function() {
					new Histogram({ name: 'name', help: 'help', labelNames: [ 'le' ] });
				};
				expect(fn).to.throw(Error);
			});

			it('should observe value if outside most upper bound', function() {
				instance.observe(100000);
				const values = instance.get().values;
				const count = getValueByLabel('+Inf', values, 'le');
				expect(count.value).to.equal(1);
			});

			it('should allow to be reset itself', function() {
				instance.observe(0.5);
				let valuePair = getValueByName('test_histogram_count', instance.get().values);
				expect(valuePair.value).to.equal(1);
				instance.reset();
				valuePair = getValueByName('test_histogram_count', instance.get().values);
				expect(valuePair.value).to.equal(undefined);
			});

			describe('labels', function() {
				beforeEach(function() {
					instance = new Histogram({ name: 'histogram_labels', help: 'Histogram with labels fn', labelNames: [ 'method' ] } );
				});

				it('should observe', function() {
					instance.labels('get').observe(4);
					const res = getValueByLeAndLabel(5, 'method', 'get', instance.get().values);
					expect(res.value).to.equal(1);
				});

				it('should not allow different number of labels', function() {
					const fn = function() {
						instance.labels('get', '500').observe(4);
					};
					expect(fn).to.throw(Error);
				});

				it('should start a timer', function() {
					const clock = sinon.useFakeTimers();
					const end = instance.labels('get').startTimer();
					clock.tick(500);
					end();
					const res = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
					expect(res.value).to.equal(1);
					clock.restore();
				});

				it('should start a timer and set labels afterwards', function(){
					const clock = sinon.useFakeTimers();
					const end = instance.startTimer();
					clock.tick(500);
					end({ 'method': 'get' });
					const res = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
					expect(res.value).to.equal(1);
					clock.restore();
				});

				it('should allow labels before and after timers', function(){
					instance = new Histogram({ name: 'histogram_labels_2', help: 'Histogram with labels fn', labelNames: [ 'method', 'success' ] });
					const clock = sinon.useFakeTimers();
					const end = instance.startTimer({ 'method': 'get' });
					clock.tick(500);
					end({ 'success': 'SUCCESS' });
					const res1 = getValueByLeAndLabel(0.5, 'method', 'get', instance.get().values);
					const res2 = getValueByLeAndLabel(0.5, 'success', 'SUCCESS', instance.get().values);
					expect(res1.value).to.equal(1);
					expect(res2.value).to.equal(1);
					clock.restore();
				});
			});
		});
		describe('without registry', function() {
			beforeEach(function() {
				instance = new Histogram({ name: 'test_histogram', help: 'test', registers: [ ] });
			});
			it('should increase count', function() {
				instance.observe(0.5);
				const valuePair = getValueByName('test_histogram_count', instance.get().values);
				expect(valuePair.value).to.equal(1);
				expect(globalRegistry.getMetricsAsJSON().length).to.equal(0);
			});
		});
		describe('registry instance', function() {
			let registryInstance;
			beforeEach(function() {
				registryInstance = new Registry();
				instance = new Histogram({ name: 'test_histogram', help: 'test', registers: [ registryInstance ] });
			});
			it('should increment counter', function() {
				instance.observe(0.5);
				const valuePair = getValueByName('test_histogram_count', instance.get().values);
				expect(valuePair.value).to.equal(1);
				expect(globalRegistry.getMetricsAsJSON().length).to.equal(0);
				expect(registryInstance.getMetricsAsJSON().length).to.equal(1);
			});
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

'use strict';

describe('summary', function() {
	var Summary = require('../index').Summary;
	var Registry = require('../index').Registry;
	var globalRegistry = require('../index').register;
	var sinon = require('sinon');
	var instance;

	describe('global registry', function() {
		afterEach(function() {
			globalRegistry.clear();
		});

		describe('with a parameter for each variable', function() {
			beforeEach(function() {
				instance = new Summary('summary_test', 'test');
			});

			it('should add a value to the summary', function() {
				instance.observe(100);
				expect(instance.get().values[0].labels.quantile).toEqual(0.01);
				expect(instance.get().values[0].value).toEqual(100);
				expect(instance.get().values[7].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[7].value).toEqual(100);
				expect(instance.get().values[8].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[8].value).toEqual(1);
			});

			it('should be able to observe 0s', function() {
				instance.observe(0);
				expect(instance.get().values[8].value).toEqual(1);
			});

			it('should correctly calculate percentiles when more values are added to the summary', function() {
				instance.observe(100);
				instance.observe(100);
				instance.observe(100);
				instance.observe(50);
				instance.observe(50);

				expect(instance.get().values.length).toEqual(9);

				expect(instance.get().values[0].labels.quantile).toEqual(0.01);
				expect(instance.get().values[0].value).toEqual(50);

				expect(instance.get().values[1].labels.quantile).toEqual(0.05);
				expect(instance.get().values[1].value).toEqual(50);

				expect(instance.get().values[2].labels.quantile).toEqual(0.5);
				expect(instance.get().values[2].value).toEqual(80);

				expect(instance.get().values[3].labels.quantile).toEqual(0.9);
				expect(instance.get().values[3].value).toEqual(100);

				expect(instance.get().values[4].labels.quantile).toEqual(0.95);
				expect(instance.get().values[4].value).toEqual(100);

				expect(instance.get().values[5].labels.quantile).toEqual(0.99);
				expect(instance.get().values[5].value).toEqual(100);

				expect(instance.get().values[6].labels.quantile).toEqual(0.999);
				expect(instance.get().values[6].value).toEqual(100);

				expect(instance.get().values[7].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[7].value).toEqual(400);

				expect(instance.get().values[8].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[8].value).toEqual(5);
			});

			it('should correctly use calculate other percentiles when configured', function() {
				globalRegistry.clear();
				instance = new Summary('summary_test', 'test', {
					percentiles: [0.5, 0.9]
				});
				instance.observe(100);
				instance.observe(100);
				instance.observe(100);
				instance.observe(50);
				instance.observe(50);

				expect(instance.get().values.length).toEqual(4);

				expect(instance.get().values[0].labels.quantile).toEqual(0.5);
				expect(instance.get().values[0].value).toEqual(80);

				expect(instance.get().values[1].labels.quantile).toEqual(0.9);
				expect(instance.get().values[1].value).toEqual(100);

				expect(instance.get().values[2].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[2].value).toEqual(400);

				expect(instance.get().values[3].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[3].value).toEqual(5);
			});

			it('should allow to reset itself', function() {
				globalRegistry.clear();
				instance = new Summary('summary_test', 'test', { percentiles: [0.5] });
				instance.observe(100);
				expect(instance.get().values[0].labels.quantile).toEqual(0.5);
				expect(instance.get().values[0].value).toEqual(100);

				expect(instance.get().values[1].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[1].value).toEqual(100);

				expect(instance.get().values[2].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[2].value).toEqual(1);

				instance.reset();

				expect(instance.get().values[0].labels.quantile).toEqual(0.5);
				expect(instance.get().values[0].value).toEqual(0);

				expect(instance.get().values[1].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[1].value).toEqual(0);

				expect(instance.get().values[2].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[2].value).toEqual(0);
			});

			describe('labels', function() {
				beforeEach(function() {
					globalRegistry.clear();
					instance = new Summary(
						'summary_test',
						'help',
						['method', 'endpoint'],
						{ percentiles: [0.9] }
					);
				});

				it('should record and calculate the correct values per label', function() {
					instance.labels('GET', '/test').observe(50);
					instance.labels('POST', '/test').observe(100);

					var values = instance.get().values;
					expect(values).toHaveLength(6);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(50);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(50);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					expect(values[3].labels.quantile).toEqual(0.9);
					expect(values[3].labels.method).toEqual('POST');
					expect(values[3].labels.endpoint).toEqual('/test');
					expect(values[3].value).toEqual(100);

					expect(values[4].metricName).toEqual('summary_test_sum');
					expect(values[4].labels.method).toEqual('POST');
					expect(values[4].labels.endpoint).toEqual('/test');
					expect(values[4].value).toEqual(100);

					expect(values[5].metricName).toEqual('summary_test_count');
					expect(values[5].labels.method).toEqual('POST');
					expect(values[5].labels.endpoint).toEqual('/test');
					expect(values[5].value).toEqual(1);
				});

				it('should throw error if label lengths does not match', function() {
					var fn = function() {
						instance.labels('GET').observe();
					};
					expect(fn).toThrowError(Error);
				});

				it('should start a timer', function() {
					var clock = sinon.useFakeTimers();
					var end = instance.labels('GET', '/test').startTimer();
					clock.tick(1000);
					end();
					var values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(1);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(1);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.restore();
				});

				it('should start a timer and set labels afterwards', function() {
					var clock = sinon.useFakeTimers();
					var end = instance.startTimer();
					clock.tick(1000);
					end({ method: 'GET', endpoint: '/test' });
					var values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(1);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(1);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.restore();
				});

				it('should allow labels before and after timers', function() {
					var clock = sinon.useFakeTimers();
					var end = instance.startTimer({ method: 'GET' });
					clock.tick(1000);
					end({ endpoint: '/test' });
					var values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(1);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(1);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.restore();
				});
			});
		});

		describe('with param as object', function() {
			beforeEach(function() {
				instance = new Summary({ name: 'summary_test', help: 'test' });
			});

			it('should add a value to the summary', function() {
				instance.observe(100);
				expect(instance.get().values[0].labels.quantile).toEqual(0.01);
				expect(instance.get().values[0].value).toEqual(100);
				expect(instance.get().values[7].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[7].value).toEqual(100);
				expect(instance.get().values[8].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[8].value).toEqual(1);
			});

			it('should be able to observe 0s', function() {
				instance.observe(0);
				expect(instance.get().values[8].value).toEqual(1);
			});

			it('should correctly calculate percentiles when more values are added to the summary', function() {
				instance.observe(100);
				instance.observe(100);
				instance.observe(100);
				instance.observe(50);
				instance.observe(50);

				expect(instance.get().values.length).toEqual(9);

				expect(instance.get().values[0].labels.quantile).toEqual(0.01);
				expect(instance.get().values[0].value).toEqual(50);

				expect(instance.get().values[1].labels.quantile).toEqual(0.05);
				expect(instance.get().values[1].value).toEqual(50);

				expect(instance.get().values[2].labels.quantile).toEqual(0.5);
				expect(instance.get().values[2].value).toEqual(80);

				expect(instance.get().values[3].labels.quantile).toEqual(0.9);
				expect(instance.get().values[3].value).toEqual(100);

				expect(instance.get().values[4].labels.quantile).toEqual(0.95);
				expect(instance.get().values[4].value).toEqual(100);

				expect(instance.get().values[5].labels.quantile).toEqual(0.99);
				expect(instance.get().values[5].value).toEqual(100);

				expect(instance.get().values[6].labels.quantile).toEqual(0.999);
				expect(instance.get().values[6].value).toEqual(100);

				expect(instance.get().values[7].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[7].value).toEqual(400);

				expect(instance.get().values[8].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[8].value).toEqual(5);
			});

			it('should correctly use calculate other percentiles when configured', function() {
				globalRegistry.clear();
				instance = new Summary({
					name: 'summary_test',
					help: 'test',
					percentiles: [0.5, 0.9]
				});
				instance.observe(100);
				instance.observe(100);
				instance.observe(100);
				instance.observe(50);
				instance.observe(50);

				expect(instance.get().values.length).toEqual(4);

				expect(instance.get().values[0].labels.quantile).toEqual(0.5);
				expect(instance.get().values[0].value).toEqual(80);

				expect(instance.get().values[1].labels.quantile).toEqual(0.9);
				expect(instance.get().values[1].value).toEqual(100);

				expect(instance.get().values[2].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[2].value).toEqual(400);

				expect(instance.get().values[3].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[3].value).toEqual(5);
			});

			it('should allow to reset itself', function() {
				globalRegistry.clear();
				instance = new Summary({
					name: 'summary_test',
					help: 'test',
					percentiles: [0.5]
				});
				instance.observe(100);
				expect(instance.get().values[0].labels.quantile).toEqual(0.5);
				expect(instance.get().values[0].value).toEqual(100);

				expect(instance.get().values[1].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[1].value).toEqual(100);

				expect(instance.get().values[2].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[2].value).toEqual(1);

				instance.reset();

				expect(instance.get().values[0].labels.quantile).toEqual(0.5);
				expect(instance.get().values[0].value).toEqual(0);

				expect(instance.get().values[1].metricName).toEqual('summary_test_sum');
				expect(instance.get().values[1].value).toEqual(0);

				expect(instance.get().values[2].metricName).toEqual(
					'summary_test_count'
				);
				expect(instance.get().values[2].value).toEqual(0);
			});

			describe('labels', function() {
				beforeEach(function() {
					globalRegistry.clear();
					instance = new Summary({
						name: 'summary_test',
						help: 'help',
						labelNames: ['method', 'endpoint'],
						percentiles: [0.9]
					});
				});

				it('should record and calculate the correct values per label', function() {
					instance.labels('GET', '/test').observe(50);
					instance.labels('POST', '/test').observe(100);

					var values = instance.get().values;
					expect(values).toHaveLength(6);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(50);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(50);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					expect(values[3].labels.quantile).toEqual(0.9);
					expect(values[3].labels.method).toEqual('POST');
					expect(values[3].labels.endpoint).toEqual('/test');
					expect(values[3].value).toEqual(100);

					expect(values[4].metricName).toEqual('summary_test_sum');
					expect(values[4].labels.method).toEqual('POST');
					expect(values[4].labels.endpoint).toEqual('/test');
					expect(values[4].value).toEqual(100);

					expect(values[5].metricName).toEqual('summary_test_count');
					expect(values[5].labels.method).toEqual('POST');
					expect(values[5].labels.endpoint).toEqual('/test');
					expect(values[5].value).toEqual(1);
				});

				it('should throw error if label lengths does not match', function() {
					var fn = function() {
						instance.labels('GET').observe();
					};
					expect(fn).toThrowError(Error);
				});

				it('should start a timer', function() {
					var clock = sinon.useFakeTimers();
					var end = instance.labels('GET', '/test').startTimer();
					clock.tick(1000);
					end();
					var values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(1);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(1);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.restore();
				});

				it('should start a timer and set labels afterwards', function() {
					var clock = sinon.useFakeTimers();
					var end = instance.startTimer();
					clock.tick(1000);
					end({ method: 'GET', endpoint: '/test' });
					var values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(1);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(1);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.restore();
				});

				it('should allow labels before and after timers', function() {
					var clock = sinon.useFakeTimers();
					var end = instance.startTimer({ method: 'GET' });
					clock.tick(1000);
					end({ endpoint: '/test' });
					var values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.method).toEqual('GET');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].value).toEqual(1);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('GET');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(1);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('GET');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.restore();
				});
			});
		});
	});
	describe('without registry', function() {
		beforeEach(function() {
			instance = new Summary({
				name: 'summary_test',
				help: 'test',
				registers: []
			});
		});
		it('should increase count', function() {
			instance.observe(100);
			expect(instance.get().values[0].labels.quantile).toEqual(0.01);
			expect(instance.get().values[0].value).toEqual(100);
			expect(instance.get().values[7].metricName).toEqual('summary_test_sum');
			expect(instance.get().values[7].value).toEqual(100);
			expect(instance.get().values[8].metricName).toEqual('summary_test_count');
			expect(instance.get().values[8].value).toEqual(1);
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
		});
	});
	describe('registry instance', function() {
		var registryInstance;
		beforeEach(function() {
			registryInstance = new Registry();
			instance = new Summary({
				name: 'summary_test',
				help: 'test',
				registers: [registryInstance]
			});
		});
		it('should increment counter', function() {
			instance.observe(100);
			expect(instance.get().values[0].labels.quantile).toEqual(0.01);
			expect(instance.get().values[0].value).toEqual(100);
			expect(instance.get().values[7].metricName).toEqual('summary_test_sum');
			expect(instance.get().values[7].value).toEqual(100);
			expect(instance.get().values[8].metricName).toEqual('summary_test_count');
			expect(instance.get().values[8].value).toEqual(1);
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
			expect(registryInstance.getMetricsAsJSON().length).toEqual(1);
		});
	});
});

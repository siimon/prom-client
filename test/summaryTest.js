'use strict';

describe('summary', () => {
	const Summary = require('../index').Summary;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	const lolex = require('lolex');
	let instance;

	describe('global registry', () => {
		afterEach(() => {
			globalRegistry.clear();
		});

		describe('with param as object', () => {
			beforeEach(() => {
				instance = new Summary({ name: 'summary_test', help: 'test' });
			});

			it('should add a value to the summary', () => {
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

			it('should be able to observe 0s', () => {
				instance.observe(0);
				expect(instance.get().values[8].value).toEqual(1);
			});

			it('should correctly calculate percentiles when more values are added to the summary', () => {
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

			it('should correctly use calculate other percentiles when configured', () => {
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

			it('should allow to reset itself', () => {
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

			describe('labels', () => {
				beforeEach(() => {
					globalRegistry.clear();
					instance = new Summary({
						name: 'summary_test',
						help: 'help',
						labelNames: ['method', 'endpoint'],
						percentiles: [0.9]
					});
				});

				it('should record and calculate the correct values per label', () => {
					instance.labels('GET', '/test').observe(50);
					instance.labels('POST', '/test').observe(100);

					const values = instance.get().values;
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

				it('should throw error if label lengths does not match', () => {
					const fn = function() {
						instance.labels('GET').observe();
					};
					expect(fn).toThrowErrorMatchingSnapshot();
				});

				it('should start a timer', () => {
					const clock = lolex.install();
					const end = instance.labels('GET', '/test').startTimer();
					clock.tick(1000);
					end();
					const values = instance.get().values;
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

					clock.uninstall();
				});

				it('should start a timer and set labels afterwards', () => {
					const clock = lolex.install();
					const end = instance.startTimer();
					clock.tick(1000);
					end({ method: 'GET', endpoint: '/test' });
					const values = instance.get().values;
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

					clock.uninstall();
				});

				it('should allow labels before and after timers', () => {
					const clock = lolex.install();
					const end = instance.startTimer({ method: 'GET' });
					clock.tick(1000);
					end({ endpoint: '/test' });
					const values = instance.get().values;
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

					clock.uninstall();
				});

				it('should not mutate passed startLabels', () => {
					const startLabels = { method: 'GET' };
					const end = instance.startTimer(startLabels);
					end({ endpoint: '/test' });
					expect(startLabels).toEqual({ method: 'GET' });
				});
			});

			describe('remove', () => {
				beforeEach(() => {
					globalRegistry.clear();
					instance = new Summary({
						name: 'summary_test',
						help: 'help',
						labelNames: ['method', 'endpoint'],
						percentiles: [0.9]
					});

					instance.labels('GET', '/test').observe(50);
					instance.labels('POST', '/test').observe(100);
				});

				it('should remove matching label', () => {
					instance.remove('GET', '/test');

					const values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].labels.method).toEqual('POST');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].value).toEqual(100);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('POST');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(100);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('POST');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);
				});

				it('should remove all labels', () => {
					instance.remove('GET', '/test');
					instance.remove('POST', '/test');

					expect(instance.get().values).toHaveLength(0);
				});

				it('should throw error if label lengths does not match', () => {
					const fn = function() {
						instance.remove('GET');
					};
					expect(fn).toThrowErrorMatchingSnapshot();
				});

				it('should remove timer values', () => {
					const clock = lolex.install();
					const end = instance.labels('GET', '/test').startTimer();
					clock.tick(1000);
					end();
					instance.remove('GET', '/test');

					const values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].labels.method).toEqual('POST');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].value).toEqual(100);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('POST');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(100);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('POST');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.uninstall();
				});

				it('should remove timer values when labels are set afterwards', () => {
					const clock = lolex.install();
					const end = instance.startTimer();
					clock.tick(1000);
					end({ method: 'GET', endpoint: '/test' });
					instance.remove('GET', '/test');

					const values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].labels.method).toEqual('POST');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].value).toEqual(100);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('POST');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(100);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('POST');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.uninstall();
				});

				it('should remove timer values with before and after labels', () => {
					const clock = lolex.install();
					const end = instance.startTimer({ method: 'GET' });
					clock.tick(1000);
					end({ endpoint: '/test' });
					instance.remove('GET', '/test');

					const values = instance.get().values;
					expect(values).toHaveLength(3);
					expect(values[0].labels.quantile).toEqual(0.9);
					expect(values[0].labels.method).toEqual('POST');
					expect(values[0].labels.endpoint).toEqual('/test');
					expect(values[0].value).toEqual(100);

					expect(values[1].metricName).toEqual('summary_test_sum');
					expect(values[1].labels.method).toEqual('POST');
					expect(values[1].labels.endpoint).toEqual('/test');
					expect(values[1].value).toEqual(100);

					expect(values[2].metricName).toEqual('summary_test_count');
					expect(values[2].labels.method).toEqual('POST');
					expect(values[2].labels.endpoint).toEqual('/test');
					expect(values[2].value).toEqual(1);

					clock.uninstall();
				});
			});
		});
	});
	describe('without registry', () => {
		beforeEach(() => {
			instance = new Summary({
				name: 'summary_test',
				help: 'test',
				registers: []
			});
		});
		it('should increase count', () => {
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
	describe('registry instance', () => {
		let registryInstance;
		beforeEach(() => {
			registryInstance = new Registry();
			instance = new Summary({
				name: 'summary_test',
				help: 'test',
				registers: [registryInstance]
			});
		});
		it('should increment counter', () => {
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
	describe('sliding window', () => {
		let clock;
		beforeEach(() => {
			globalRegistry.clear();
			clock = lolex.install();
		});

		it('should slide when maxAgeSeconds and ageBuckets are set', () => {
			const localInstance = new Summary({
				name: 'summary_test',
				help: 'test',
				maxAgeSeconds: 5,
				ageBuckets: 5
			});

			localInstance.observe(100);

			for (let i = 0; i < 5; i++) {
				expect(localInstance.get().values[0].labels.quantile).toEqual(0.01);
				expect(localInstance.get().values[0].value).toEqual(100);
				expect(localInstance.get().values[7].metricName).toEqual(
					'summary_test_sum'
				);
				expect(localInstance.get().values[7].value).toEqual(100);
				expect(localInstance.get().values[8].metricName).toEqual(
					'summary_test_count'
				);
				expect(localInstance.get().values[8].value).toEqual(1);
				clock.tick(1001);
			}

			expect(localInstance.get().values[0].labels.quantile).toEqual(0.01);
			expect(localInstance.get().values[0].value).toEqual(0);
		});

		it('should not slide when maxAgeSeconds and ageBuckets are not configured', () => {
			const localInstance = new Summary({
				name: 'summary_test',
				help: 'test'
			});
			localInstance.observe(100);

			for (let i = 0; i < 5; i++) {
				expect(localInstance.get().values[0].labels.quantile).toEqual(0.01);
				expect(localInstance.get().values[0].value).toEqual(100);
				expect(localInstance.get().values[7].metricName).toEqual(
					'summary_test_sum'
				);
				expect(localInstance.get().values[7].value).toEqual(100);
				expect(localInstance.get().values[8].metricName).toEqual(
					'summary_test_count'
				);
				expect(localInstance.get().values[8].value).toEqual(1);
				clock.tick(1001);
			}

			expect(localInstance.get().values[0].labels.quantile).toEqual(0.01);
			expect(localInstance.get().values[0].value).toEqual(100);
		});
	});
});

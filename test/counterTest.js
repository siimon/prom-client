'use strict';

const Registry = require('../index').Registry;

describe.each([
	['Prometheus', Registry.PROMETHEUS_CONTENT_TYPE],
	['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE],
])('counter with %s registry', (tag, regType) => {
	const Counter = require('../index').Counter;
	const globalRegistry = require('../index').register;
	/** @type {Counter} */
	let instance;

	beforeEach(() => {
		globalRegistry.setContentType(regType);
	});

	describe('with params as object', () => {
		beforeEach(() => {
			instance = new Counter({ name: 'gauge_test', help: 'test' });
		});
		afterEach(() => {
			globalRegistry.clear();
		});

		it('should increment counter', async () => {
			instance.inc();
			expect((await instance.get()).values[0].value).toEqual(1);
			instance.inc();
			expect((await instance.get()).values[0].value).toEqual(2);
			instance.inc(0);
			expect((await instance.get()).values[0].value).toEqual(2);
		});
		it('should increment with a provided value', async () => {
			instance.inc(100);
			expect((await instance.get()).values[0].value).toEqual(100);
		});
		it('should not be possible to decrease a counter', () => {
			const fn = function () {
				instance.inc(-100);
			};
			expect(fn).toThrowErrorMatchingSnapshot();
		});
		it('should throw an error when the value is not a number', () => {
			const fn = () => {
				instance.inc('3ms');
			};
			expect(fn).toThrowErrorMatchingSnapshot();
		});
		it('should handle incrementing with 0', async () => {
			instance.inc(0);
			expect((await instance.get()).values[0].value).toEqual(0);
		});
		it('should init counter to 0', async () => {
			const values = (await instance.get()).values;
			expect(values).toHaveLength(1);
			expect(values[0].value).toEqual(0);
		});

		describe('labels', () => {
			beforeEach(() => {
				instance = new Counter({
					name: 'gauge_test_2',
					help: 'help',
					labelNames: ['method', 'endpoint'],
				});
			});

			it('should handle 1 value per label', async () => {
				instance.labels('GET', '/test').inc();
				instance.labels('POST', '/test').inc();

				const values = (await instance.get()).values;
				expect(values).toHaveLength(2);
			});

			it('should handle labels provided as an object', async () => {
				instance.labels({ method: 'POST', endpoint: '/test' }).inc();
				const values = (await instance.get()).values;
				expect(values).toHaveLength(1);
				expect(values[0].labels).toEqual({
					method: 'POST',
					endpoint: '/test',
				});
			});

			it('should handle labels which are provided as arguments to inc()', async () => {
				instance.inc({ method: 'GET', endpoint: '/test' });
				instance.inc({ method: 'POST', endpoint: '/test' });

				const values = (await instance.get()).values;
				expect(values).toHaveLength(2);
			});

			it('should throw error if label lengths does not match', () => {
				const fn = function () {
					instance.labels('GET').inc();
				};
				expect(fn).toThrowErrorMatchingSnapshot();
			});

			it('should increment label value with provided value', async () => {
				instance.labels('GET', '/test').inc(100);
				const values = (await instance.get()).values;
				expect(values[0].value).toEqual(100);
			});
		});

		describe('default label values', () => {
			beforeEach(() => {
				instance = new Counter({
					name: 'counter_test',
					help: 'help',
					labelNames: ['method', 'endpoint', 'protocol'],
					defaultLabels: {
						protocol: 'https',
					},
				});
			});

			it("then throws an error on construction if labels don't match up", () => {
				expect.assertions(4);
				try {
					new Counter({
						name: 'counter_test_2',
						help: 'help',
						labelNames: ['method', 'endpoint', 'protocol'],
						defaultLabels: {
							a_bad_label: 'oh noooo',
						},
					});
				} catch (error) {
					expect(error).toBeInstanceOf(Error);
					expect(error.message).toEqual('Invalid default label values');
					expect(error.cause).toBeInstanceOf(Error);
					expect(error.cause.message).toEqual(
						"Added label \"a_bad_label\" is not included in initial labelset: [ 'method', 'endpoint', 'protocol' ]",
					);
				}
			});

			describe('inc', () => {
				it('should increment label value with provided value plus any default labels', async () => {
					instance.labels({ method: 'GET', endpoint: '/test' }).inc(100);
					const values = (await instance.get()).values;
					expect(values[0].value).toEqual(100);
					expect(values[0].labels).toEqual({
						method: 'GET',
						endpoint: '/test',
						protocol: 'https',
					});
				});

				it('allows specifying value for default label', async () => {
					instance.labels('GET', '/test', 'http').inc(100);
					const values = (await instance.get()).values;
					expect(values[0].value).toEqual(100);
					expect(values[0].labels).toEqual({
						method: 'GET',
						endpoint: '/test',
						protocol: 'http',
					});
				});
			});

			describe('remove', () => {
				it('then removes without specifying default labels', async () => {
					instance.labels({ method: 'GET', endpoint: '/test' }).inc(100);
					instance.labels({ method: 'POST', endpoint: '/test' }).inc(100);

					instance.remove({ method: 'POST', endpoint: '/test' });

					const values = (await instance.get()).values;
					expect(values.length).toEqual(1);
				});

				it('then removes with specifying default labels', async () => {
					instance.labels({ method: 'GET', endpoint: '/test' }).inc(100);
					instance.labels({ method: 'POST', endpoint: '/test' }).inc(100);

					instance.remove('POST', '/test', 'https');

					const values = (await instance.get()).values;
					expect(values.length).toEqual(1);
				});
			});
		});
	});

	describe('remove', () => {
		beforeEach(() => {
			instance = new Counter({
				name: 'gauge_test_3',
				help: 'help',
				labelNames: ['method', 'endpoint'],
			});
			instance.inc({ method: 'GET', endpoint: '/test' });
			instance.inc({ method: 'POST', endpoint: '/test' });
		});

		afterEach(() => {
			globalRegistry.clear();
		});

		it('should remove matching label', async () => {
			instance.remove('POST', '/test');

			const values = (await instance.get()).values;
			expect(values).toHaveLength(1);
			expect(values[0].value).toEqual(1);
			expect(values[0].labels.method).toEqual('GET');
			expect(values[0].labels.endpoint).toEqual('/test');
			expect(values[0].timestamp).toEqual(undefined);
		});

		it('should remove by labels object', async () => {
			instance.remove({ method: 'POST', endpoint: '/test' });

			const values = (await instance.get()).values;
			expect(values).toHaveLength(1);
			expect(values[0].labels).toEqual({
				method: 'GET',
				endpoint: '/test',
			});
		});

		it('should remove all labels', async () => {
			instance.remove('GET', '/test');
			instance.remove('POST', '/test');

			expect((await instance.get()).values).toHaveLength(0);
		});

		it('should throw error if label lengths does not match', () => {
			const fn = function () {
				instance.remove('GET');
			};
			expect(fn).toThrowErrorMatchingSnapshot();
		});
	});

	describe('without registry', () => {
		beforeEach(() => {
			instance = new Counter({
				name: 'gauge_test',
				help: 'test',
				registers: [],
			});
		});
		it('should increment counter', async () => {
			instance.inc();
			expect((await globalRegistry.getMetricsAsJSON()).length).toEqual(0);
			expect((await instance.get()).values[0].value).toEqual(1);
			expect((await instance.get()).values[0].timestamp).toEqual(undefined);
		});
	});
	describe('registry instance', () => {
		let registryInstance;
		beforeEach(() => {
			registryInstance = new Registry(regType);
			instance = new Counter({
				name: 'gauge_test',
				help: 'test',
				registers: [registryInstance],
			});
		});
		it('should increment counter', async () => {
			instance.inc();
			expect((await globalRegistry.getMetricsAsJSON()).length).toEqual(0);
			expect((await registryInstance.getMetricsAsJSON()).length).toEqual(1);
			expect((await instance.get()).values[0].value).toEqual(1);
			expect((await instance.get()).values[0].timestamp).toEqual(undefined);
		});
	});
	describe('counter reset', () => {
		afterEach(() => {
			globalRegistry.clear();
		});
		it('should reset labelless counter', async () => {
			const instance = new Counter({
				name: 'test_metric',
				help: 'Another test metric',
			});

			instance.inc(12);
			expect((await instance.get()).values[0].value).toEqual(12);

			instance.reset();
			expect((await instance.get()).values[0].value).toEqual(0);

			instance.inc(10);
			expect((await instance.get()).values[0].value).toEqual(10);
		});
		it('should reset the counter, incl labels', async () => {
			const instance = new Counter({
				name: 'test_metric',
				help: 'Another test metric',
				labelNames: ['serial', 'active'],
			});

			instance.inc({ serial: '12345', active: 'yes' }, 12);
			expect((await instance.get()).values[0].value).toEqual(12);
			expect((await instance.get()).values[0].labels.serial).toEqual('12345');
			expect((await instance.get()).values[0].labels.active).toEqual('yes');

			instance.reset();

			expect((await instance.get()).values).toEqual([]);

			instance.inc({ serial: '12345', active: 'no' }, 10);
			expect((await instance.get()).values[0].value).toEqual(10);
			expect((await instance.get()).values[0].labels.serial).toEqual('12345');
			expect((await instance.get()).values[0].labels.active).toEqual('no');
		});
		it('should reset the counter, incl default labels', async () => {
			const instance = new Counter({
				name: 'test_metric',
				help: 'Another test metric',
				labelNames: ['serial', 'active', 'color'],
				defaultLabels: { color: 'red' },
			});

			instance.inc({ serial: '12345', active: 'yes' }, 12);
			expect((await instance.get()).values[0].value).toEqual(12);
			expect((await instance.get()).values[0].labels.serial).toEqual('12345');
			expect((await instance.get()).values[0].labels.active).toEqual('yes');
			expect((await instance.get()).values[0].labels.color).toEqual('red');

			instance.inc({ serial: '12345', active: 'yes', color: 'blue' }, 12);
			expect((await instance.get()).values[1].value).toEqual(12);
			expect((await instance.get()).values[1].labels.serial).toEqual('12345');
			expect((await instance.get()).values[1].labels.active).toEqual('yes');
			expect((await instance.get()).values[1].labels.color).toEqual('blue');

			instance.reset();

			expect((await instance.get()).values).toEqual([]);
		});
	});
});

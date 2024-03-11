'use strict';

const Registry = require('../index').Registry;

describe.each([
	['Prometheus', Registry.PROMETHEUS_CONTENT_TYPE],
	['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE],
])('gauge with %s registry', (tag, regType) => {
	const Gauge = require('../index').Gauge;
	const globalRegistry = require('../index').register;
	/** @type { Gauge } */
	let instance;

	beforeEach(() => {
		globalRegistry.setContentType(regType);
	});

	describe('global registry', () => {
		afterEach(() => {
			globalRegistry.clear();
		});

		describe('with parameters as object', () => {
			beforeEach(() => {
				instance = new Gauge({ name: 'gauge_test', help: 'help' });
				instance.set(10);
			});

			it('should set a gauge to provided value', async () => {
				await expectValue(10);
			});

			it('should increase with 1 if no param provided', async () => {
				instance.inc();
				await expectValue(11);
			});

			it('should increase with param value if provided', async () => {
				instance.inc(5);
				await expectValue(15);
			});

			it('should decrease with 1 if no param provided', async () => {
				instance.dec();
				await expectValue(9);
			});

			it('should decrease with param if provided', async () => {
				instance.dec(5);
				await expectValue(5);
			});

			it('should set to exactly zero without defaulting to 1', async () => {
				instance.set(0);
				await expectValue(0);
			});

			it('should inc by zero without defaulting to 1', async () => {
				instance.inc(0);
				await expectValue(10);
			});

			it('should start a timer and set a gauge to elapsed in seconds', async () => {
				jest.useFakeTimers('modern');
				jest.setSystemTime(0);
				const doneFn = instance.startTimer();
				jest.advanceTimersByTime(500);
				const dur = doneFn();
				await expectValue(0.5);
				expect(dur).toEqual(0.5);
				jest.useRealTimers();
			});

			it('should set to current time', async () => {
				jest.useFakeTimers('modern');
				jest.setSystemTime(0);
				instance.setToCurrentTime();
				await expectValue(Date.now());
				jest.useRealTimers();
			});

			it('should not allow non numbers', () => {
				const fn = function () {
					instance.set('asd');
				};
				expect(fn).toThrowErrorMatchingSnapshot();
			});

			it('should init to 0', async () => {
				instance = new Gauge({
					name: 'init_gauge',
					help: 'somehelp',
				});
				await expectValue(0);
			});

			describe('with labels', () => {
				beforeEach(() => {
					instance = new Gauge({
						name: 'name',
						help: 'help',
						labelNames: ['code'],
					});
					instance.set({ code: '200' }, 20);
				});
				it('should be able to increment', async () => {
					instance.labels('200').inc();
					await expectValue(21);
				});
				it('should be able to decrement', async () => {
					instance.labels('200').dec();
					await expectValue(19);
				});
				it('should be able to set value', async () => {
					instance.labels('200').set(500);
					await expectValue(500);
				});
				it('should be able to set value to current time', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					instance.labels('200').setToCurrentTime();
					await expectValue(Date.now());
					jest.useRealTimers();
				});
				it('should be able to start a timer', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.labels('200').startTimer();
					jest.advanceTimersByTime(1000);
					end();
					await expectValue(1);
					jest.useRealTimers();
				});
				it('should be able to start a timer and set labels afterwards', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.startTimer();
					jest.advanceTimersByTime(1000);
					end({ code: 200 });
					await expectValue(1);
					jest.useRealTimers();
				});
				it('should allow labels before and after timers', async () => {
					instance = new Gauge({
						name: 'name_2',
						help: 'help',
						labelNames: ['code', 'success'],
					});
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.startTimer({ code: 200 });
					jest.advanceTimersByTime(1000);
					end({ success: 'SUCCESS' });
					await expectValue(1);
					jest.useRealTimers();
				});
				it('should not mutate passed startLabels', () => {
					const startLabels = { code: '200' };
					const end = instance.startTimer(startLabels);
					end({ code: '400' });
					expect(startLabels).toEqual({ code: '200' });
				});
				it('should handle labels provided as an object', async () => {
					instance.labels({ code: '200' }).inc();

					const values = (await instance.get()).values;
					expect(values).toHaveLength(1);
					expect(values[0].labels).toEqual({ code: '200' });
				});
			});

			describe('default label values', () => {
				beforeEach(() => {
					instance = new Gauge({
						name: 'gauge_test_2',
						help: 'help',
						labelNames: ['method', 'endpoint', 'protocol'],
						defaultLabels: {
							protocol: 'https',
						},
					});
					instance.setToCurrentTime;
					instance.startTimer;
					instance.labels;
				});

				it("then throws an error on construction if labels don't match up", () => {
					expect.assertions(4);
					try {
						new Gauge({
							name: 'gauge_test_2',
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

				describe('set', () => {
					it('should set label value with provided value plus any default labels', async () => {
						instance.labels({ method: 'GET', endpoint: '/test' }).inc(100);
						instance.labels({ method: 'GET', endpoint: '/test' }).set(12);
						const values = (await instance.get()).values;
						expect(values[0].value).toEqual(12);
						expect(values[0].labels).toEqual({
							method: 'GET',
							endpoint: '/test',
							protocol: 'https',
						});
					});

					it('allows specifying value for default label', async () => {
						instance.labels('GET', '/test', 'http').inc(100);
						instance.labels('GET', '/test', 'http').set(12);
						const values = (await instance.get()).values;
						expect(values[0].value).toEqual(12);
						expect(values[0].labels).toEqual({
							method: 'GET',
							endpoint: '/test',
							protocol: 'http',
						});
					});
				});

				describe('dec', () => {
					it('should increment label value with provided value plus any default labels', async () => {
						instance.labels({ method: 'GET', endpoint: '/test' }).inc(100);
						instance.labels({ method: 'GET', endpoint: '/test' }).dec(50);
						const values = (await instance.get()).values;
						expect(values[0].value).toEqual(50);
						expect(values[0].labels).toEqual({
							method: 'GET',
							endpoint: '/test',
							protocol: 'https',
						});
					});

					it('allows specifying value for default label', async () => {
						instance.labels('GET', '/test', 'http').inc(100);
						instance.labels('GET', '/test', 'http').dec(50);
						const values = (await instance.get()).values;
						expect(values[0].value).toEqual(50);
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

			describe('with remove', () => {
				beforeEach(() => {
					instance = new Gauge({
						name: 'name',
						help: 'help',
						labelNames: ['code'],
					});
					instance.set({ code: '200' }, 20);
					instance.set({ code: '400' }, 0);
				});
				it('should be able to remove matching label', async () => {
					instance.remove('200');
					const values = (await instance.get()).values;
					expect(values.length).toEqual(1);
					expect(values[0].labels.code).toEqual('400');
					expect(values[0].value).toEqual(0);
				});
				it('should remove by labels object', async () => {
					instance.remove({ code: '200' });
					const values = (await instance.get()).values;
					expect(values).toHaveLength(1);
					expect(values[0].labels).toEqual({ code: '400' });
					expect(values[0].value).toEqual(0);
				});
				it('should be able to remove all labels', async () => {
					instance.remove('200');
					instance.remove('400');
					expect((await instance.get()).values.length).toEqual(0);
				});
			});
		});
	});
	describe('without registry', () => {
		afterEach(() => {
			globalRegistry.clear();
		});
		beforeEach(() => {
			instance = new Gauge({ name: 'gauge_test', help: 'help', registers: [] });
			instance.set(10);
		});
		it('should set a gauge to provided value', async () => {
			await expectValue(10);
			expect((await globalRegistry.getMetricsAsJSON()).length).toEqual(0);
		});
	});
	describe('registry instance', () => {
		let registryInstance;
		beforeEach(() => {
			registryInstance = new Registry(regType);
			instance = new Gauge({
				name: 'gauge_test',
				help: 'help',
				registers: [registryInstance],
			});
			instance.set(10);
		});
		it('should set a gauge to provided value', async () => {
			expect((await globalRegistry.getMetricsAsJSON()).length).toEqual(0);
			expect((await registryInstance.getMetricsAsJSON()).length).toEqual(1);
			await expectValue(10);
		});
	});
	describe('gauge reset', () => {
		afterEach(() => {
			globalRegistry.clear();
		});
		it('should reset labelless gauge', async () => {
			const instance = new Gauge({
				name: 'test_metric',
				help: 'Another test metric',
			});

			instance.set(12);
			expect((await instance.get()).values[0].value).toEqual(12);

			instance.reset();
			expect((await instance.get()).values[0].value).toEqual(0);

			instance.set(10);
			expect((await instance.get()).values[0].value).toEqual(10);
		});
		it('should reset the gauge, incl labels', async () => {
			const instance = new Gauge({
				name: 'test_metric',
				help: 'Another test metric',
				labelNames: ['serial', 'active'],
			});

			instance.set({ serial: '12345', active: 'yes' }, 12);
			expect((await instance.get()).values[0].value).toEqual(12);
			expect((await instance.get()).values[0].labels.serial).toEqual('12345');
			expect((await instance.get()).values[0].labels.active).toEqual('yes');

			instance.reset();

			expect((await instance.get()).values).toEqual([]);

			instance.set({ serial: '12345', active: 'no' }, 10);
			expect((await instance.get()).values[0].value).toEqual(10);
			expect((await instance.get()).values[0].labels.serial).toEqual('12345');
			expect((await instance.get()).values[0].labels.active).toEqual('no');
		});
		it('should reset the gauge, incl default labels', async () => {
			const instance = new Gauge({
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

	async function expectValue(val) {
		expect((await instance.get()).values[0].value).toEqual(val);
	}
});

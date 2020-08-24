'use strict';

describe('gauge', () => {
	const Gauge = require('../index').Gauge;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	let instance;

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

			it('should start a timer and set a gauge to elapsed in seconds', async () => {
				jest.useFakeTimers('modern');
				jest.setSystemTime(0);
				const doneFn = instance.startTimer();
				jest.advanceTimersByTime(500);
				doneFn();
				await expectValue(0.5);
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
			registryInstance = new Registry();
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
	});

	async function expectValue(val) {
		expect((await instance.get()).values[0].value).toEqual(val);
	}
});

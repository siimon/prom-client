'use strict';

describe('gauge', () => {
	const Gauge = require('../index').Gauge;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	const lolex = require('lolex');
	let instance;

	describe('global registry', () => {
		afterEach(() => {
			globalRegistry.clear();
		});
		describe('with a parameter for each variable', () => {
			beforeEach(() => {
				instance = new Gauge('gauge_test', 'help');
				instance.set(10);
			});

			it('should set a gauge to provided value', () => {
				expectValue(10);
			});

			it('should increase with 1 if no param provided', () => {
				instance.inc();
				expectValue(11);
			});

			it('should increase with param value if provided', () => {
				instance.inc(5);
				expectValue(15);
			});

			it('should decrease with 1 if no param provided', () => {
				instance.dec();
				expectValue(9);
			});

			it('should decrease with param if provided', () => {
				instance.dec(5);
				expectValue(5);
			});

			it('should start a timer and set a gauge to elapsed in seconds', () => {
				const clock = lolex.install();
				const doneFn = instance.startTimer();
				clock.tick(500);
				doneFn();
				expectValue(0.5);
				clock.uninstall();
			});

			it('should set to current time', () => {
				const clock = lolex.install();
				instance.setToCurrentTime();
				expectValue(Date.now());
				clock.uninstall();
			});

			it('should not allow non numbers', () => {
				const fn = function() {
					instance.set('asd');
				};
				expect(fn).toThrowError(Error);
			});

			describe('with labels', () => {
				beforeEach(() => {
					instance = new Gauge('name', 'help', ['code']);
					instance.set({ code: '200' }, 20);
				});
				it('should be able to increment', () => {
					instance.labels('200').inc();
					expectValueWithLabels(21);
				});
				it('should be able to decrement', () => {
					instance.labels('200').dec();
					expectValueWithLabels(19);
				});
				it('should be able to set value', () => {
					instance.labels('200').set(500);
					expectValueWithLabels(500);
				});
				it('should be able to set value to current time', () => {
					const clock = lolex.install();
					instance.labels('200').setToCurrentTime();
					expectValueWithLabels(Date.now());
					clock.uninstall();
				});
				it('should be able to start a timer', () => {
					const clock = lolex.install();
					const end = instance.labels('200').startTimer();
					clock.tick(1000);
					end();
					expectValueWithLabels(1);
					clock.uninstall();
				});
				it('should be able to start a timer and set labels afterwards', () => {
					const clock = lolex.install();
					const end = instance.startTimer();
					clock.tick(1000);
					end({ code: 200 });
					expectValueWithLabels(1);
					clock.uninstall();
				});
				it('should allow labels before and after timers', () => {
					instance = new Gauge('name_2', 'help', ['code', 'success']);
					const clock = lolex.install();
					const end = instance.startTimer({ code: 200 });
					clock.tick(1000);
					end({ success: 'SUCCESS' });
					expectValueWithLabels(1);
					clock.uninstall();
				});
			});

			describe('with timestamp', () => {
				beforeEach(() => {
					instance = new Gauge('name', 'help', ['code']);
					instance.set({ code: '200' }, 20);
				});
				it('should be able to set value and timestamp as Date', () => {
					instance.labels('200').set(500, new Date('2017-01-26T01:05Z'));
					expectValueWithLabels(500, 1485392700000);
				});
				it('should be able to set value and timestamp as number', () => {
					instance.labels('200').set(500, 1485392700000);
					expectValueWithLabels(500, 1485392700000);
				});
				it('should not allow non numbers', () => {
					const fn = function() {
						instance.labels('200').set(500, 'blah');
					};
					expect(fn).toThrowError(Error);
				});
				it('should not allow invalid dates', () => {
					const fn = function() {
						instance.labels('200').set(500, new Date('blah'));
					};
					expect(fn).toThrowError(Error);
				});
				it('should be able to increment', () => {
					instance.labels('200').inc(1, 1485392700000);
					expectValueWithLabels(21, 1485392700000);
				});
				it('should be able to decrement', () => {
					instance.labels('200').dec(1, 1485392700000);
					expectValueWithLabels(19, 1485392700000);
				});
			});
		});

		describe('with parameters as object', () => {
			beforeEach(() => {
				instance = new Gauge({ name: 'gauge_test', help: 'help' });
				instance.set(10);
			});

			it('should set a gauge to provided value', () => {
				expectValue(10);
			});

			it('should increase with 1 if no param provided', () => {
				instance.inc();
				expectValue(11);
			});

			it('should increase with param value if provided', () => {
				instance.inc(5);
				expectValue(15);
			});

			it('should decrease with 1 if no param provided', () => {
				instance.dec();
				expectValue(9);
			});

			it('should decrease with param if provided', () => {
				instance.dec(5);
				expectValue(5);
			});

			it('should start a timer and set a gauge to elapsed in seconds', () => {
				const clock = lolex.install();
				const doneFn = instance.startTimer();
				clock.tick(500);
				doneFn();
				expectValue(0.5);
				clock.uninstall();
			});

			it('should set to current time', () => {
				const clock = lolex.install();
				instance.setToCurrentTime();
				expectValue(Date.now());
				clock.uninstall();
			});

			it('should not allow non numbers', () => {
				const fn = function() {
					instance.set('asd');
				};
				expect(fn).toThrowError(Error);
			});

			it('should init to 0', () => {
				instance = new Gauge({
					name: 'init_gauge',
					help: 'somehelp'
				});
				expectValue(0);
			});

			describe('with labels', () => {
				beforeEach(() => {
					instance = new Gauge({
						name: 'name',
						help: 'help',
						labelNames: ['code']
					});
					instance.set({ code: '200' }, 20);
				});
				it('should be able to increment', () => {
					instance.labels('200').inc();
					expectValueWithLabels(21);
				});
				it('should be able to decrement', () => {
					instance.labels('200').dec();
					expectValueWithLabels(19);
				});
				it('should be able to set value', () => {
					instance.labels('200').set(500);
					expectValueWithLabels(500);
				});
				it('should be able to set value to current time', () => {
					const clock = lolex.install();
					instance.labels('200').setToCurrentTime();
					expectValueWithLabels(Date.now());
					clock.uninstall();
				});
				it('should be able to start a timer', () => {
					const clock = lolex.install();
					const end = instance.labels('200').startTimer();
					clock.tick(1000);
					end();
					expectValueWithLabels(1);
					clock.uninstall();
				});
				it('should be able to start a timer and set labels afterwards', () => {
					const clock = lolex.install();
					const end = instance.startTimer();
					clock.tick(1000);
					end({ code: 200 });
					expectValueWithLabels(1);
					clock.uninstall();
				});
				it('should allow labels before and after timers', () => {
					instance = new Gauge({
						name: 'name_2',
						help: 'help',
						labelNames: ['code', 'success']
					});
					const clock = lolex.install();
					const end = instance.startTimer({ code: 200 });
					clock.tick(1000);
					end({ success: 'SUCCESS' });
					expectValueWithLabels(1);
					clock.uninstall();
				});
			});

			describe('with timestamp', () => {
				beforeEach(() => {
					instance = new Gauge('name', 'help', ['code']);
					instance.set({ code: '200' }, 20);
				});
				it('should be able to set value and timestamp as Date', () => {
					instance.labels('200').set(500, new Date('2017-01-26T01:05Z'));
					expectValueWithLabels(500, 1485392700000);
				});
				it('should be able to set value and timestamp as number', () => {
					instance.labels('200').set(500, 1485392700000);
					expectValueWithLabels(500, 1485392700000);
				});
				it('should not allow non numbers', () => {
					const fn = function() {
						instance.labels('200').set(500, 'blah');
					};
					expect(fn).toThrowError(Error);
				});
				it('should not allow invalid dates', () => {
					const fn = function() {
						instance.labels('200').set(500, new Date('blah'));
					};
					expect(fn).toThrowError(Error);
				});
				it('should be able to increment', () => {
					instance.labels('200').inc(1, 1485392700000);
					expectValueWithLabels(21, 1485392700000);
				});
				it('should be able to decrement', () => {
					instance.labels('200').dec(1, 1485392700000);
					expectValueWithLabels(19, 1485392700000);
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
		it('should set a gauge to provided value', () => {
			expectValue(10);
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
		});
	});
	describe('registry instance', () => {
		let registryInstance;
		beforeEach(() => {
			registryInstance = new Registry();
			instance = new Gauge({
				name: 'gauge_test',
				help: 'help',
				registers: [registryInstance]
			});
			instance.set(10);
		});
		it('should set a gauge to provided value', () => {
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
			expect(registryInstance.getMetricsAsJSON().length).toEqual(1);
			expectValue(10);
		});

		describe('with timestamp', () => {
			beforeEach(() => {
				instance = new Gauge({
					name: 'name',
					help: 'help',
					labelNames: ['code'],
					registers: [registryInstance]
				});
				instance.set({ code: '200' }, 20);
			});
			it('should be able to set value and timestamp as Date', () => {
				instance.labels('200').set(500, new Date('2017-01-26T01:05Z'));
				expectValueWithLabels(500, 1485392700000);
			});
			it('should be able to set value and timestamp as number', () => {
				instance.labels('200').set(500, 1485392700000);
				expectValueWithLabels(500, 1485392700000);
			});
			it('should not allow non numbers', () => {
				const fn = function() {
					instance.labels('200').set(500, 'blah');
				};
				expect(fn).toThrowError(Error);
			});
			it('should not allow invalid dates', () => {
				const fn = function() {
					instance.labels('200').set(500, new Date('blah'));
				};
				expect(fn).toThrowError(Error);
			});
			it('should be able to increment', () => {
				instance.labels('200').inc(1, 1485392700000);
				expectValueWithLabels(21, 1485392700000);
			});
			it('should be able to decrement', () => {
				instance.labels('200').dec(1, 1485392700000);
				expectValueWithLabels(19, 1485392700000);
			});
		});
	});

	function expectValue(val, timestamp) {
		expect(instance.get().values[0].value).toEqual(val);
		expect(instance.get().values[0].timestamp).toEqual(timestamp);
	}

	function expectValueWithLabels(val, timestamp) {
		expect(instance.get().values[1].value).toEqual(val);
		expect(instance.get().values[1].timestamp).toEqual(timestamp);
	}
});

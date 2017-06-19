'use strict';

describe('gauge', function() {
	const Gauge = require('../index').Gauge;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	const sinon = require('sinon');
	let instance;

	describe('global registry', function() {
		afterEach(function() {
			globalRegistry.clear();
		});
		describe('with a parameter for each variable', function() {
			beforeEach(function() {
				instance = new Gauge('gauge_test', 'help');
				instance.set(10);
			});

			it('should set a gauge to provided value', function() {
				expectValue(10);
			});

			it('should increase with 1 if no param provided', function() {
				instance.inc();
				expectValue(11);
			});

			it('should increase with param value if provided', function() {
				instance.inc(5);
				expectValue(15);
			});

			it('should decrease with 1 if no param provided', function() {
				instance.dec();
				expectValue(9);
			});

			it('should decrease with param if provided', function() {
				instance.dec(5);
				expectValue(5);
			});

			it('should start a timer and set a gauge to elapsed in seconds', function() {
				const clock = sinon.useFakeTimers();
				const doneFn = instance.startTimer();
				clock.tick(500);
				doneFn();
				expectValue(0.5);
				clock.restore();
			});

			it('should set to current time', function() {
				const clock = sinon.useFakeTimers();
				instance.setToCurrentTime();
				expectValue(Date.now());
				clock.restore();
			});

			it('should not allow non numbers', function() {
				const fn = function() {
					instance.set('asd');
				};
				expect(fn).toThrowError(Error);
			});

			describe('with labels', function() {
				beforeEach(function() {
					instance = new Gauge('name', 'help', ['code']);
					instance.set({ code: '200' }, 20);
				});
				it('should be able to increment', function() {
					instance.labels('200').inc();
					expectValue(21);
				});
				it('should be able to decrement', function() {
					instance.labels('200').dec();
					expectValue(19);
				});
				it('should be able to set value', function() {
					instance.labels('200').set(500);
					expectValue(500);
				});
				it('should be able to set value to current time', function() {
					const clock = sinon.useFakeTimers();
					instance.labels('200').setToCurrentTime();
					expectValue(Date.now());
					clock.restore();
				});
				it('should be able to start a timer', function() {
					const clock = sinon.useFakeTimers();
					const end = instance.labels('200').startTimer();
					clock.tick(1000);
					end();
					expectValue(1);
					clock.restore();
				});
				it('should be able to start a timer and set labels afterwards', function() {
					const clock = sinon.useFakeTimers();
					const end = instance.startTimer();
					clock.tick(1000);
					end({ code: 200 });
					expectValue(1);
					clock.restore();
				});
				it('should allow labels before and after timers', function() {
					instance = new Gauge('name_2', 'help', ['code', 'success']);
					const clock = sinon.useFakeTimers();
					const end = instance.startTimer({ code: 200 });
					clock.tick(1000);
					end({ success: 'SUCCESS' });
					expectValue(1);
					clock.restore();
				});
			});

			describe('with timestamp', function() {
				beforeEach(function() {
					instance = new Gauge('name', 'help', ['code']);
					instance.set({ code: '200' }, 20);
				});
				it('should be able to set value and timestamp as Date', function() {
					instance.labels('200').set(500, new Date('2017-01-26T01:05Z'));
					expectValue(500, 1485392700000);
				});
				it('should be able to set value and timestamp as number', function() {
					instance.labels('200').set(500, 1485392700000);
					expectValue(500, 1485392700000);
				});
				it('should not allow non numbers', function() {
					const fn = function() {
						instance.labels('200').set(500, 'blah');
					};
					expect(fn).toThrowError(Error);
				});
				it('should not allow invalid dates', function() {
					const fn = function() {
						instance.labels('200').set(500, new Date('blah'));
					};
					expect(fn).toThrowError(Error);
				});
				it('should be able to increment', function() {
					instance.labels('200').inc(1, 1485392700000);
					expectValue(21, 1485392700000);
				});
				it('should be able to decrement', function() {
					instance.labels('200').dec(1, 1485392700000);
					expectValue(19, 1485392700000);
				});
			});
		});

		describe('with parameters as object', function() {
			beforeEach(function() {
				instance = new Gauge({ name: 'gauge_test', help: 'help' });
				instance.set(10);
			});

			it('should set a gauge to provided value', function() {
				expectValue(10);
			});

			it('should increase with 1 if no param provided', function() {
				instance.inc();
				expectValue(11);
			});

			it('should increase with param value if provided', function() {
				instance.inc(5);
				expectValue(15);
			});

			it('should decrease with 1 if no param provided', function() {
				instance.dec();
				expectValue(9);
			});

			it('should decrease with param if provided', function() {
				instance.dec(5);
				expectValue(5);
			});

			it('should start a timer and set a gauge to elapsed in seconds', function() {
				const clock = sinon.useFakeTimers();
				const doneFn = instance.startTimer();
				clock.tick(500);
				doneFn();
				expectValue(0.5);
				clock.restore();
			});

			it('should set to current time', function() {
				const clock = sinon.useFakeTimers();
				instance.setToCurrentTime();
				expectValue(Date.now());
				clock.restore();
			});

			it('should not allow non numbers', function() {
				const fn = function() {
					instance.set('asd');
				};
				expect(fn).toThrowError(Error);
			});

			describe('with labels', function() {
				beforeEach(function() {
					instance = new Gauge({
						name: 'name',
						help: 'help',
						labelNames: ['code']
					});
					instance.set({ code: '200' }, 20);
				});
				it('should be able to increment', function() {
					instance.labels('200').inc();
					expectValue(21);
				});
				it('should be able to decrement', function() {
					instance.labels('200').dec();
					expectValue(19);
				});
				it('should be able to set value', function() {
					instance.labels('200').set(500);
					expectValue(500);
				});
				it('should be able to set value to current time', function() {
					const clock = sinon.useFakeTimers();
					instance.labels('200').setToCurrentTime();
					expectValue(Date.now());
					clock.restore();
				});
				it('should be able to start a timer', function() {
					const clock = sinon.useFakeTimers();
					const end = instance.labels('200').startTimer();
					clock.tick(1000);
					end();
					expectValue(1);
					clock.restore();
				});
				it('should be able to start a timer and set labels afterwards', function() {
					const clock = sinon.useFakeTimers();
					const end = instance.startTimer();
					clock.tick(1000);
					end({ code: 200 });
					expectValue(1);
					clock.restore();
				});
				it('should allow labels before and after timers', function() {
					instance = new Gauge({
						name: 'name_2',
						help: 'help',
						labelNames: ['code', 'success']
					});
					const clock = sinon.useFakeTimers();
					const end = instance.startTimer({ code: 200 });
					clock.tick(1000);
					end({ success: 'SUCCESS' });
					expectValue(1);
					clock.restore();
				});
			});

			describe('with timestamp', function() {
				beforeEach(function() {
					instance = new Gauge('name', 'help', ['code']);
					instance.set({ code: '200' }, 20);
				});
				it('should be able to set value and timestamp as Date', function() {
					instance.labels('200').set(500, new Date('2017-01-26T01:05Z'));
					expectValue(500, 1485392700000);
				});
				it('should be able to set value and timestamp as number', function() {
					instance.labels('200').set(500, 1485392700000);
					expectValue(500, 1485392700000);
				});
				it('should not allow non numbers', function() {
					const fn = function() {
						instance.labels('200').set(500, 'blah');
					};
					expect(fn).toThrowError(Error);
				});
				it('should not allow invalid dates', function() {
					const fn = function() {
						instance.labels('200').set(500, new Date('blah'));
					};
					expect(fn).toThrowError(Error);
				});
				it('should be able to increment', function() {
					instance.labels('200').inc(1, 1485392700000);
					expectValue(21, 1485392700000);
				});
				it('should be able to decrement', function() {
					instance.labels('200').dec(1, 1485392700000);
					expectValue(19, 1485392700000);
				});
			});
		});
	});
	describe('without registry', function() {
		afterEach(function() {
			globalRegistry.clear();
		});
		beforeEach(function() {
			instance = new Gauge({ name: 'gauge_test', help: 'help', registers: [] });
			instance.set(10);
		});
		it('should set a gauge to provided value', function() {
			expectValue(10);
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
		});
	});
	describe('registry instance', function() {
		let registryInstance;
		beforeEach(function() {
			registryInstance = new Registry();
			instance = new Gauge({
				name: 'gauge_test',
				help: 'help',
				registers: [registryInstance]
			});
			instance.set(10);
		});
		it('should set a gauge to provided value', function() {
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
			expect(registryInstance.getMetricsAsJSON().length).toEqual(1);
			expectValue(10);
		});

		describe('with timestamp', function() {
			beforeEach(function() {
				instance = new Gauge({
					name: 'name',
					help: 'help',
					labelNames: ['code'],
					registers: [registryInstance]
				});
				instance.set({ code: '200' }, 20);
			});
			it('should be able to set value and timestamp as Date', function() {
				instance.labels('200').set(500, new Date('2017-01-26T01:05Z'));
				expectValue(500, 1485392700000);
			});
			it('should be able to set value and timestamp as number', function() {
				instance.labels('200').set(500, 1485392700000);
				expectValue(500, 1485392700000);
			});
			it('should not allow non numbers', function() {
				const fn = function() {
					instance.labels('200').set(500, 'blah');
				};
				expect(fn).toThrowError(Error);
			});
			it('should not allow invalid dates', function() {
				const fn = function() {
					instance.labels('200').set(500, new Date('blah'));
				};
				expect(fn).toThrowError(Error);
			});
			it('should be able to increment', function() {
				instance.labels('200').inc(1, 1485392700000);
				expectValue(21, 1485392700000);
			});
			it('should be able to decrement', function() {
				instance.labels('200').dec(1, 1485392700000);
				expectValue(19, 1485392700000);
			});
		});
	});

	function expectValue(val, timestamp) {
		expect(instance.get().values[0].value).toEqual(val);
		expect(instance.get().values[0].timestamp).toEqual(timestamp);
	}
});

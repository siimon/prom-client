'use strict';

describe('counter', () => {
	const Counter = require('../index').Counter;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	const expect = require('chai').expect;
	let instance;

	describe('global registry', () => {
		describe('with a parameter for each variable', () => {

			beforeEach(() => {
				instance = new Counter('gauge_test', 'test');
			});

			afterEach(() => {
				globalRegistry.clear();
			});
			it('should increment counter', () => {
				instance.inc();
				expect(instance.get().values[0].value).to.equal(1);
				expect(instance.get().values[0].timestamp).to.equal(undefined);
			});
			it('should increment with a provided value', () => {
				instance.inc(100);
				expect(instance.get().values[0].value).to.equal(100);
				expect(instance.get().values[0].timestamp).to.equal(undefined);
			});
			it('should increment with a provided value and timestamp', () => {
				instance.inc(100, 1485392700000);
				expect(instance.get().values[0].value).to.equal(100);
				expect(instance.get().values[0].timestamp).to.equal(1485392700000);
			});
			it('should not allow non number as timestamp', () => {
				const fn = function() {
					instance.inc(1, 'blah');
				};
				expect(fn).to.throw(Error);
			});
			it('should not allow invalid date as timestamp', () => {
				const fn = function() {
					instance.inc(1, new Date('blah'));
				};
				expect(fn).to.throw(Error);
			});
			it('should not be possible to decrease a counter', () => {
				const fn = function() {
					instance.inc(-100);
				};
				expect(fn).to.throw(Error);
			});
			it('should handle incrementing with 0', () => {
				instance.inc(0);
				expect(instance.get().values[0].value).to.equal(0);
			});

			describe('labels', () => {
				beforeEach(() => {
					instance = new Counter('gauge_test_2', 'help', [ 'method', 'endpoint']);
				});

				it('should increment counter', () => {
					instance.inc();
					expect(instance.get().values[0].value).to.equal(1);
					expect(instance.get().values[0].timestamp).to.equal(undefined);
				});
				it('should handle 1 value per label', () => {
					instance.labels('GET', '/test').inc();
					instance.labels('POST', '/test').inc();

					const values = instance.get().values;
					expect(values).to.have.length(2);
				});

				it('should handle labels which are provided as arguments to inc()', () => {
					instance.inc({method: 'GET', endpoint: '/test'});
					instance.inc({method: 'POST', endpoint: '/test'});

					const values = instance.get().values;
					expect(values).to.have.length(2);
				});

				it('should throw error if label lengths does not match', () => {
					const fn = function() {
						instance.labels('GET').inc();
					};
					expect(fn).to.throw(Error);
				});

				it('should increment label value with provided value', () => {
					instance.labels('GET', '/test').inc(100);
					const values = instance.get().values;
					expect(values[0].value).to.equal(100);
				});
			});
		});
	});

	describe('with params as object', () => {
		beforeEach(() => {
			instance = new Counter({ name: 'gauge_test', help: 'test' });
		});
		afterEach(() => {
			globalRegistry.clear();
		});

		it('should increment counter', () => {
			instance.inc();
			expect(instance.get().values[0].value).to.equal(1);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
		it('should increment with a provided value', () => {
			instance.inc(100);
			expect(instance.get().values[0].value).to.equal(100);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
		it('should increment with a provided value and timestamp', () => {
			instance.inc(100, 1485392700000);
			expect(instance.get().values[0].value).to.equal(100);
			expect(instance.get().values[0].timestamp).to.equal(1485392700000);
		});
		it('should not allow non number as timestamp', () => {
			const fn = function() {
				instance.inc(1, 'blah');
			};
			expect(fn).to.throw(Error);
		});
		it('should not allow invalid date as timestamp', () => {
			const fn = function() {
				instance.inc(1, new Date('blah'));
			};
			expect(fn).to.throw(Error);
		});
		it('should not be possible to decrease a counter', () => {
			const fn = function() {
				instance.inc(-100);
			};
			expect(fn).to.throw(Error);
		});
		it('should handle incrementing with 0', () => {
			instance.inc(0);
			expect(instance.get().values[0].value).to.equal(0);
		});

		describe('labels', () => {
			beforeEach(() => {
				instance = new Counter({ name: 'gauge_test_2', help: 'help', labelNames: [ 'method', 'endpoint'] });
			});

			it('should handle 1 value per label', () => {
				instance.labels('GET', '/test').inc();
				instance.labels('POST', '/test').inc();

				const values = instance.get().values;
				expect(values).to.have.length(2);
			});

			it('should handle labels which are provided as arguments to inc()', () => {
				instance.inc({method: 'GET', endpoint: '/test'});
				instance.inc({method: 'POST', endpoint: '/test'});

				const values = instance.get().values;
				expect(values).to.have.length(2);
			});

			it('should throw error if label lengths does not match', () => {
				const fn = function() {
					instance.labels('GET').inc();
				};
				expect(fn).to.throw(Error);
			});

			it('should throw error if label lengths does not match', () => {
				const fn = function() {
					instance.labels('GET').inc();
				};
				expect(fn).to.throw(Error);
			});

			it('should increment label value with provided value', () => {
				instance.labels('GET', '/test').inc(100);
				const values = instance.get().values;
				expect(values[0].value).to.equal(100);
			});
		});
	});
	describe('without registry', () => {
		beforeEach(() => {
			instance = new Counter({ name: 'gauge_test', help: 'test', registers: [] });
		});
		it('should increment counter', () => {
			instance.inc();
			expect(globalRegistry.getMetricsAsJSON().length).to.equal(0);
			expect(instance.get().values[0].value).to.equal(1);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
	});
	describe('registry instance', () => {
		let registryInstance;
		beforeEach(() => {
			registryInstance = new Registry();
			instance = new Counter({ name: 'gauge_test', help: 'test', registers: [ registryInstance ] });
		});
		it('should increment counter', () => {
			instance.inc();
			expect(globalRegistry.getMetricsAsJSON().length).to.equal(0);
			expect(registryInstance.getMetricsAsJSON().length).to.equal(1);
			expect(instance.get().values[0].value).to.equal(1);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
	});
});

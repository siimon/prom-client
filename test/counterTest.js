'use strict';

describe('counter', function() {
	var Counter = require('../index').Counter;
	var Registry = require('../index').Registry;
	var globalRegistry = require('../index').register;
	var instance;

	describe('global registry', function() {
		describe('with a parameter for each variable', function() {

			beforeEach(function() {
				instance = new Counter('gauge_test', 'test');
			});

			afterEach(function() {
				globalRegistry.clear();
			});
			it('should increment counter', function() {
				instance.inc();
				expect(instance.get().values[0].value).toEqual(1);
				expect(instance.get().values[0].timestamp).toEqual(undefined);
			});
			it('should increment with a provided value', function() {
				instance.inc(100);
				expect(instance.get().values[0].value).toEqual(100);
				expect(instance.get().values[0].timestamp).toEqual(undefined);
			});
			it('should increment with a provided value and timestamp', function() {
				instance.inc(100, 1485392700000);
				expect(instance.get().values[0].value).toEqual(100);
				expect(instance.get().values[0].timestamp).toEqual(1485392700000);
			});
			it('should not allow non number as timestamp', function() {
				var fn = function() {
					instance.inc(1, 'blah');
				};
				expect(fn).toThrowError(Error);
			});
			it('should not allow invalid date as timestamp', function() {
				var fn = function() {
					instance.inc(1, new Date('blah'));
				};
				expect(fn).toThrowError(Error);
			});
			it('should not be possible to decrease a counter', function() {
				var fn = function() {
					instance.inc(-100);
				};
				expect(fn).toThrowError(Error);
			});
			it('should handle incrementing with 0', function() {
				instance.inc(0);
				expect(instance.get().values[0].value).toEqual(0);
			});

			describe('labels', function() {
				beforeEach(function() {
					instance = new Counter('gauge_test_2', 'help', [ 'method', 'endpoint']);
				});

				it('should increment counter', function() {
					instance.inc();
					expect(instance.get().values[0].value).toEqual(1);
					expect(instance.get().values[0].timestamp).toEqual(undefined);
				});
				it('should handle 1 value per label', function() {
					instance.labels('GET', '/test').inc();
					instance.labels('POST', '/test').inc();

					var values = instance.get().values;
					expect(values).toHaveLength(2);
				});

				it('should handle labels which are provided as arguments to inc()', function() {
					instance.inc({method: 'GET', endpoint: '/test'});
					instance.inc({method: 'POST', endpoint: '/test'});

					var values = instance.get().values;
					expect(values).toHaveLength(2);
				});

				it('should throw error if label lengths does not match', function() {
					var fn = function() {
						instance.labels('GET').inc();
					};
					expect(fn).toThrowError(Error);
				});

				it('should increment label value with provided value', function() {
					instance.labels('GET', '/test').inc(100);
					var values = instance.get().values;
					expect(values[0].value).toEqual(100);
				});
			});
		});

		describe('get as protobuf', function() {
			beforeEach(function() {
				instance = new Counter({ name: 'gauge_test', help: 'test', labelNames: [ 'method', 'endpoint'] });
			});
			afterEach(function() {
				globalRegistry.clear();
			});

			it('should get as protobuf compliant object', function() {
				instance.labels('GET', '/test').inc(1234, 1485392700000);
				var validValue = {
					name: 'gauge_test',
					help: 'test',
					type: 0,
					metric: [{
						label: [
							{
								name: 'method',
								value: 'GET'
							},
							{
								name: 'endpoint',
								value: '/test'
							}
						],
						timestampMs: 1485392700000,
						counter: {
							value: 1234
						}
					}]
				};
				var value = instance.getProtoCompliant();
				expect(value).to.deep.equal(validValue);
			});
		});
	});

	describe('with params as object', function() {
		beforeEach(function() {
			instance = new Counter({ name: 'gauge_test', help: 'test' });
		});
		afterEach(function() {
			globalRegistry.clear();
		});

		it('should increment counter', function() {
			instance.inc();
			expect(instance.get().values[0].value).toEqual(1);
			expect(instance.get().values[0].timestamp).toEqual(undefined);
		});
		it('should increment with a provided value', function() {
			instance.inc(100);
			expect(instance.get().values[0].value).toEqual(100);
			expect(instance.get().values[0].timestamp).toEqual(undefined);
		});
		it('should increment with a provided value and timestamp', function() {
			instance.inc(100, 1485392700000);
			expect(instance.get().values[0].value).toEqual(100);
			expect(instance.get().values[0].timestamp).toEqual(1485392700000);
		});
		it('should not allow non number as timestamp', function() {
			var fn = function() {
				instance.inc(1, 'blah');
			};
			expect(fn).toThrowError(Error);
		});
		it('should not allow invalid date as timestamp', function() {
			var fn = function() {
				instance.inc(1, new Date('blah'));
			};
			expect(fn).toThrowError(Error);
		});
		it('should not be possible to decrease a counter', function() {
			var fn = function() {
				instance.inc(-100);
			};
			expect(fn).toThrowError(Error);
		});
		it('should handle incrementing with 0', function() {
			instance.inc(0);
			expect(instance.get().values[0].value).toEqual(0);
		});

		describe('labels', function() {
			beforeEach(function() {
				instance = new Counter({ name: 'gauge_test_2', help: 'help', labelNames: [ 'method', 'endpoint'] });
			});

			it('should handle 1 value per label', function() {
				instance.labels('GET', '/test').inc();
				instance.labels('POST', '/test').inc();

				var values = instance.get().values;
				expect(values).toHaveLength(2);
			});

			it('should handle labels which are provided as arguments to inc()', function() {
				instance.inc({method: 'GET', endpoint: '/test'});
				instance.inc({method: 'POST', endpoint: '/test'});

				var values = instance.get().values;
				expect(values).toHaveLength(2);
			});

			it('should throw error if label lengths does not match', function() {
				var fn = function() {
					instance.labels('GET').inc();
				};
				expect(fn).toThrowError(Error);
			});

			it('should throw error if label lengths does not match', function() {
				var fn = function() {
					instance.labels('GET').inc();
				};
				expect(fn).toThrowError(Error);
			});

			it('should increment label value with provided value', function() {
				instance.labels('GET', '/test').inc(100);
				var values = instance.get().values;
				expect(values[0].value).toEqual(100);
			});
		});
	});
	describe('without registry', function() {
		beforeEach(function() {
			instance = new Counter({ name: 'gauge_test', help: 'test', registers: [] });
		});
		it('should increment counter', function() {
			instance.inc();
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
			expect(instance.get().values[0].value).toEqual(1);
			expect(instance.get().values[0].timestamp).toEqual(undefined);
		});
	});
	describe('registry instance', function() {
		var registryInstance;
		beforeEach(function() {
			registryInstance = new Registry();
			instance = new Counter({ name: 'gauge_test', help: 'test', registers: [ registryInstance ] });
		});
		it('should increment counter', function() {
			instance.inc();
			expect(globalRegistry.getMetricsAsJSON().length).toEqual(0);
			expect(registryInstance.getMetricsAsJSON().length).toEqual(1);
			expect(instance.get().values[0].value).toEqual(1);
			expect(instance.get().values[0].timestamp).toEqual(undefined);
		});
	});
});

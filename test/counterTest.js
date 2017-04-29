'use strict';

describe('counter', function() {
	var Counter = require('../index').Counter;
	var register = require('../index').register;
	var expect = require('chai').expect;
	var instance;

	afterEach(function() {
		register.clear();
	});

	describe('with a parameter for each variable', function() {

		beforeEach(function() {
			instance = new Counter('gauge_test', 'test');
		});

		it('should increment counter', function() {
			instance.inc();
			expect(instance.get().values[0].value).to.equal(1);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
		it('should increment with a provided value', function() {
			instance.inc(100);
			expect(instance.get().values[0].value).to.equal(100);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
		it('should increment with a provided value and timestamp', function() {
			instance.inc(100, 1485392700000);
			expect(instance.get().values[0].value).to.equal(100);
			expect(instance.get().values[0].timestamp).to.equal(1485392700000);
		});
		it('should not allow non number as timestamp', function() {
			var fn = function() {
				instance.inc(1, 'blah');
			};
			expect(fn).to.throw(Error);
		});
		it('should not allow invalid date as timestamp', function() {
			var fn = function() {
				instance.inc(1, new Date('blah'));
			};
			expect(fn).to.throw(Error);
		});
		it('should not be possible to decrease a counter', function() {
			var fn = function() {
				instance.inc(-100);
			};
			expect(fn).to.throw(Error);
		});
		it('should handle incrementing with 0', function() {
			instance.inc(0);
			expect(instance.get().values[0].value).to.equal(0);
		});

		describe('labels', function() {
			beforeEach(function() {
				instance = new Counter('gauge_test_2', 'help', [ 'method', 'endpoint']);
			});

			it('should handle 1 value per label', function() {
				instance.labels('GET', '/test').inc();
				instance.labels('POST', '/test').inc();

				var values = instance.get().values;
				expect(values).to.have.length(2);
			});

			it('should handle labels which are provided as arguments to inc()', function() {
				instance.inc({method: 'GET', endpoint: '/test'});
				instance.inc({method: 'POST', endpoint: '/test'});

				var values = instance.get().values;
				expect(values).to.have.length(2);
			});

			it('should throw error if label lengths does not match', function() {
				var fn = function() {
					instance.labels('GET').inc();
				};
				expect(fn).to.throw(Error);
			});

			it('should increment label value with provided value', function() {
				instance.labels('GET', '/test').inc(100);
				var values = instance.get().values;
				expect(values[0].value).to.equal(100);
			});
		});
	});

	describe('with params as object', function() {
		beforeEach(function() {
			instance = new Counter({ name: 'gauge_test', help: 'test' });
		});

		it('should increment counter', function() {
			instance.inc();
			expect(instance.get().values[0].value).to.equal(1);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
		it('should increment with a provided value', function() {
			instance.inc(100);
			expect(instance.get().values[0].value).to.equal(100);
			expect(instance.get().values[0].timestamp).to.equal(undefined);
		});
		it('should increment with a provided value and timestamp', function() {
			instance.inc(100, 1485392700000);
			expect(instance.get().values[0].value).to.equal(100);
			expect(instance.get().values[0].timestamp).to.equal(1485392700000);
		});
		it('should not allow non number as timestamp', function() {
			var fn = function() {
				instance.inc(1, 'blah');
			};
			expect(fn).to.throw(Error);
		});
		it('should not allow invalid date as timestamp', function() {
			var fn = function() {
				instance.inc(1, new Date('blah'));
			};
			expect(fn).to.throw(Error);
		});
		it('should not be possible to decrease a counter', function() {
			var fn = function() {
				instance.inc(-100);
			};
			expect(fn).to.throw(Error);
		});
		it('should handle incrementing with 0', function() {
			instance.inc(0);
			expect(instance.get().values[0].value).to.equal(0);
		});

		describe('labels', function() {
			beforeEach(function() {
				instance = new Counter({ name: 'gauge_test_2', help: 'help', labelNames: [ 'method', 'endpoint'] });
			});

			it('should handle 1 value per label', function() {
				instance.labels('GET', '/test').inc();
				instance.labels('POST', '/test').inc();

				var values = instance.get().values;
				expect(values).to.have.length(2);
			});

			it('should handle labels which are provided as arguments to inc()', function() {
				instance.inc({method: 'GET', endpoint: '/test'});
				instance.inc({method: 'POST', endpoint: '/test'});

				var values = instance.get().values;
				expect(values).to.have.length(2);
			});

			it('should throw error if label lengths does not match', function() {
				var fn = function() {
					instance.labels('GET').inc();
				};
				expect(fn).to.throw(Error);
			});

			it('should increment label value with provided value', function() {
				instance.labels('GET', '/test').inc(100);
				var values = instance.get().values;
				expect(values[0].value).to.equal(100);
			});
		});
	});
});

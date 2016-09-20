'use strict';

describe('counter', function() {
	var Counter = require('../index').Counter;
	var register = require('../index').register;
	var expect = require('chai').expect;
	var instance;

	beforeEach(function() {
		instance = new Counter('gauge_test', 'test');
	});

	afterEach(function() {
		register.clear();
	});

	it('should increment counter', function() {
		instance.inc();
		expect(instance.get().values[0].value).to.equal(1);
	});
	it('should increment with a provided value', function() {
		instance.inc(100);
		expect(instance.get().values[0].value).to.equal(100);
	});

	it('should not be possible to decrease a counter', function() {
		var fn = function() {
			instance.inc(-100);
		};
		expect(fn).to.throw(Error);
	});

	describe('labels', function() {
		beforeEach(function() {
			instance = new Counter('gauge_test_2', 'help', [ 'method', 'endpoint']);
		});

		it('should 1 value per label', function() {
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

'use strict';

describe('gauge', function() {
	var expect = require('chai').expect;
	var Gauge = require('../lib/gauge');
	var instance;
	beforeEach(function() {
		instance = new Gauge({});
		instance.set(10);
	});

	it('should set a gauge to provided value', function() {
		expectValue(10);
	});

	it('should reset a gauge', function() {
		instance.reset();
		expectValue(0);
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

	function expectValue(val) {
		expect(instance.get().value).to.equal(val);
	}
});

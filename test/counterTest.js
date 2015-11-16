'use strict';

describe('counter', function() {
	var Counter = require('../lib/counter');
	var expect = require('chai').expect;
	var instance;

	beforeEach(function() {
		instance = new Counter({});
	});

	it('should increment counter', function() {
		instance.inc();
		expect(instance.get().value).to.equal(1);
	});
	it('should increment with a provided value', function() {
		instance.inc(100);
		expect(instance.get().value).to.equal(100);
	});
});

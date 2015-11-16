'use strict';

describe.skip('counter', function() {
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
});

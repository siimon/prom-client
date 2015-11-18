'use strict';

describe.only('histogram', function() {
	var Histogram = require('../lib/histogram');
	var expect = require('chai').expect;
	var instance;
	beforeEach(function() {
		instance = new Histogram({});
	});

	it('should increase count', function() {
		instance.observe(0.5);
		expect(instance.get().count).to.equal(1);
	});
	it('should increase sum', function() {
		instance.observe(0.5);
		expect(instance.get().sum).to.equal(0.5);
	});

	it('should add item in upper bound bucket', function() {
		instance.observe(1);
		expect(instance.get().buckets[1]).to.equal(1);
	});
});

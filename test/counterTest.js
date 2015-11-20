'use strict';

describe('counter', function() {
	var Counter = require('../lib/counter');
	var expect = require('chai').expect;
	var instance;

	beforeEach(function() {
		instance = new Counter({ name: 'gauge_test', help: 'test'});
	});

	it('should increment counter', function() {
		instance.inc();
		expect(instance.get().values[0].value).to.equal(1);
	});
	it('should increment with a provided value', function() {
		instance.inc(100);
		expect(instance.get().values[0].value).to.equal(100);
	});

	it('should not allow non numbers', function() {
		var fn = function() {
			instance.inc('asd');
		};
		expect(fn).to.throw(Error);
	});

	it('should not be possible to decrease a counter', function() {
		var fn = function() {
			instance.inc(-100);
		};
		expect(fn).to.throw(Error);
	});
});

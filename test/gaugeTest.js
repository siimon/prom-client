'use strict';

describe('gauge', function() {
	var expect = require('chai').expect;
	var Gauge = require('../index').gauge;
	var sinon = require('sinon');
	var instance;
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
		var clock = sinon.useFakeTimers();
		var doneFn = instance.startTimer();
		clock.tick(500);
		doneFn();
		expectValue(0.5);
		clock.restore();
	});

	it('should set to current time', function() {
		var clock = sinon.useFakeTimers();
		instance.setToCurrentTime();
		expectValue(new Date().getTime());
	});

	it('should not allow non numbers', function() {
		var fn = function() {
			instance.set('asd');
		};
		expect(fn).to.throw(Error);
	});

	describe('with labels', function() {
		beforeEach(function() {
			instance = new Gauge('name', 'help', ['code']);
			instance.set({ 'code': '200' }, 20);
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
			var clock = sinon.useFakeTimers();
			instance.labels('200').setToCurrentTime();
			expectValue(new Date().getTime());
			clock.restore();
		});
		it('should be able to start a timer', function(){
			var clock = sinon.useFakeTimers();
			var end = instance.labels('200').startTimer();
			clock.tick(1000);
			end();
			expectValue(1);
			clock.restore();
		});
	});

	function expectValue(val) {
		expect(instance.get().values[0].value).to.equal(val);
	}
});

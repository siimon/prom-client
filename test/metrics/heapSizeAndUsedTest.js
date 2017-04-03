'use strict';

describe('heapSizeAndUsed', function() {
	var heapSizeAndUsed = require('../../lib/metrics/heapSizeAndUsed');
	var register = require('../../lib/register');
	var memoryUsedFn = process.memoryUsage;
	var expect = require('chai').expect;

	afterEach(function() {
		process.memoryUsage = memoryUsedFn;
		register.clear();
	});

	it('should return an empty function if memoryUsed does not exist', function() {
		process.memoryUsage = null;
		expect(heapSizeAndUsed()()).to.be.undefined;
	});

	it('should set total heap size gauge with total from memoryUsage', function() {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		var totalGauge = heapSizeAndUsed()().total.get();
		expect(totalGauge.values[0].value).to.equal(1000);
	});

	it('should set used gauge with used from memoryUsage', function() {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		var gauge = heapSizeAndUsed()().used.get();
		expect(gauge.values[0].value).to.equal(500);
	});

	it('should set external gauge with external from memoryUsage', function() {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		var gauge = heapSizeAndUsed()().external.get();
		expect(gauge.values[0].value).to.equal(100);
	});

});

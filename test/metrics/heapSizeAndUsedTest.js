'use strict';

describe('heapSizeAndUsed', function() {
	const heapSizeAndUsed = require('../../lib/metrics/heapSizeAndUsed');
	const register = require('../../lib/register');
	const memoryUsedFn = process.memoryUsage;

	afterEach(function() {
		process.memoryUsage = memoryUsedFn;
		register.clear();
	});

	it('should return an empty function if memoryUsed does not exist', function() {
		process.memoryUsage = null;
		expect(heapSizeAndUsed()()).toBeUndefined();
	});

	it('should set total heap size gauge with total from memoryUsage', function() {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const totalGauge = heapSizeAndUsed()().total.get();
		expect(totalGauge.values[0].value).toEqual(1000);
	});

	it('should set used gauge with used from memoryUsage', function() {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed()().used.get();
		expect(gauge.values[0].value).toEqual(500);
	});

	it('should set external gauge with external from memoryUsage', function() {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed()().external.get();
		expect(gauge.values[0].value).toEqual(100);
	});
});

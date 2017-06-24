'use strict';

describe('heapSizeAndUsed', () => {
	const heapSizeAndUsed = require('../../lib/metrics/heapSizeAndUsed');
	const globalRegistry = require('../../lib/registry').globalRegistry;
	const memoryUsedFn = process.memoryUsage;

	afterEach(() => {
		process.memoryUsage = memoryUsedFn;
		globalRegistry.clear();
	});

	it('should return an empty function if memoryUsed does not exist', () => {
		process.memoryUsage = null;
		expect(heapSizeAndUsed()()).toBeUndefined();
	});

	it('should set total heap size gauge with total from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const totalGauge = heapSizeAndUsed()().total.get();
		expect(totalGauge.values[0].value).toEqual(1000);
	});

	it('should set used gauge with used from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed()().used.get();
		expect(gauge.values[0].value).toEqual(500);
	});

	it('should set external gauge with external from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed()().external.get();
		expect(gauge.values[0].value).toEqual(100);
	});
});

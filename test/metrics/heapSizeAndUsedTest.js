'use strict';

describe('heapSizeAndUsed', () => {
	const heapSizeAndUsed = require('../../lib/metrics/heapSizeAndUsed');
	const register = require('../../lib/register');
	const memoryUsedFn = process.memoryUsage;
	const expect = require('chai').expect;

	afterEach(() => {
		process.memoryUsage = memoryUsedFn;
		register.clear();
	});

	it('should return an empty function if memoryUsed does not exist', () => {
		process.memoryUsage = null;
		expect(heapSizeAndUsed()()).to.be.undefined;
	});

	it('should set total heap size gauge with total from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const totalGauge = heapSizeAndUsed()().total.get();
		expect(totalGauge.values[0].value).to.equal(1000);
	});

	it('should set used gauge with used from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed()().used.get();
		expect(gauge.values[0].value).to.equal(500);
	});

	it('should set external gauge with external from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed()().external.get();
		expect(gauge.values[0].value).to.equal(100);
	});
});

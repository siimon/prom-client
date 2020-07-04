'use strict';

describe('heapSizeAndUsed', () => {
	const heapSizeAndUsed = require('../../lib/metrics/heapSizeAndUsed');
	const globalRegistry = require('../../lib/registry').globalRegistry;
	const memoryUsedFn = process.memoryUsage;

	afterEach(() => {
		process.memoryUsage = memoryUsedFn;
		globalRegistry.clear();
	});

	it('should set gauge values from memoryUsage', async () => {
		process.memoryUsage = function () {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};

		heapSizeAndUsed();
		// Note: these three gauges' values are set by the _total gauge's
		// "collect" function.

		const totalGauge = globalRegistry.getSingleMetric(
			'nodejs_heap_size_total_bytes',
		);
		expect((await totalGauge.get()).values[0].value).toEqual(1000);

		const usedGauge = globalRegistry.getSingleMetric(
			'nodejs_heap_size_used_bytes',
		);
		expect((await usedGauge.get()).values[0].value).toEqual(500);

		const externalGauge = globalRegistry.getSingleMetric(
			'nodejs_external_memory_bytes',
		);
		expect((await externalGauge.get()).values[0].value).toEqual(100);
	});
});

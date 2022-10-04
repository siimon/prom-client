'use strict';

describe('eventLoopUtilization', () => {
	const register = require('../../index').register;
	const elu = require('../../lib/metrics/eventLoopUtilization');
	const { eventLoopUtilization } = require('perf_hooks').performance;

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', async () => {
		expect(await register.getMetricsAsJSON()).toHaveLength(0);

		elu(register, { eventLoopUtilizationTimeout: 1000 });

		const eluStart = eventLoopUtilization();
		const metricsPromise = register.getMetricsAsJSON();

		setImmediate(() => blockEventLoop(500));

		const metrics = await metricsPromise;
		const eluEnd = eventLoopUtilization();

		expect(metrics).toHaveLength(1);

		const eluMetric = metrics[0];
		expect(eluMetric.help).toEqual(
			'Ratio of time the event loop is not idling in the event provider to the total time the event loop is running.',
		);
		expect(eluMetric.type).toEqual('gauge');
		expect(eluMetric.name).toEqual('nodejs_eventloop_utilization');
		expect(eluMetric.values).toHaveLength(1);

		const eluValue = eluMetric.values[0].value;
		expect(eluValue).toBeGreaterThanOrEqual(0);
		expect(eluValue).toBeLessThanOrEqual(1);

		const expectedELU = eventLoopUtilization(eluEnd, eluStart).utilization;
		expect(eluValue).toBeCloseTo(expectedELU, 2);

		console.log(eluValue, eventLoopUtilization(eluEnd, eluStart));
	});
});

function blockEventLoop(ms) {
	const start = Date.now();
	while (Date.now() - start < ms) {
		// heavy operations
	}
}

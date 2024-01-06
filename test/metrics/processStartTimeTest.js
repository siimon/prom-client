'use strict';

const Registry = require('../../index').Registry;

describe.each([
	['Prometheus', Registry.PROMETHEUS_CONTENT_TYPE],
	['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE],
])('processStartTime with %s registry', (tag, regType) => {
	const register = require('../../index').register;
	const op = require('../../lib/metrics/processStartTime');

	beforeAll(() => {
		register.clear();
	});

	beforeEach(() => {
		register.setContentType(regType);
	});

	afterEach(() => {
		register.clear();
	});

	it(`should add metric to the ${tag} registry`, async () => {
		expect(await register.getMetricsAsJSON()).toHaveLength(0);

		op();

		const metrics = await register.getMetricsAsJSON();
		const startTime = Math.ceil(Date.now() / 1000 - process.uptime());

		expect(metrics).toHaveLength(1);
		expect(metrics[0].help).toEqual(
			'Start time of the process since unix epoch in seconds.',
		);
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('process_start_time_seconds');
		expect(metrics[0].values).toHaveLength(1);
		expect(metrics[0].values[0].value).toBeLessThanOrEqual(startTime);
	});
});

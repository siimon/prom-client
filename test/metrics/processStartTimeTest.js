'use strict';

describe('processStartTime', () => {
	const register = require('../../index').register;
	const op = require('../../lib/metrics/processStartTime');

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', () => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);

		op()();

		const metrics = register.getMetricsAsJSON();
		const startTime = Math.ceil(Date.now() / 1000 - process.uptime());

		expect(metrics).toHaveLength(1);
		expect(metrics[0].help).toEqual(
			'Start time of the process since unix epoch in seconds.'
		);
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('process_start_time_seconds');
		expect(metrics[0].values).toHaveLength(1);
		expect(metrics[0].values[0].value).toBeLessThanOrEqual(startTime);
	});
});

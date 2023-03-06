'use strict';

const Registry = require('../../index').Registry;

describe.each([
	['Prometheus', Registry.PROMETHEUS_CONTENT_TYPE],
	['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE],
])('processRequests with %s registry', (tag, regType) => {
	const register = require('../../index').register;
	const processRequests = require('../../lib/metrics/processRequests');

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

		processRequests();

		const metrics = await register.getMetricsAsJSON();

		expect(metrics).toHaveLength(2);
		expect(metrics[0].help).toEqual(
			'Number of active libuv requests grouped by request type. Every request type is C++ class name.',
		);
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('nodejs_active_requests');

		expect(metrics[1].help).toEqual('Total number of active requests.');
		expect(metrics[1].type).toEqual('gauge');
		expect(metrics[1].name).toEqual('nodejs_active_requests_total');
	});
});

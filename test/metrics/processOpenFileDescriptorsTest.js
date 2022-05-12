'use strict';

const Registry = require('../../index').Registry;

jest.mock(
	'process',
	() => Object.assign({}, jest.requireActual('process'), { platform: 'linux' }), // This metric only works on Linux
);

describe.each([
	['Prometheus', Registry.PROMETHEUS_CONTENT_TYPE],
	['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE],
])('processOpenFileDescriptors with %s registry', (tag, regType) => {
	const register = require('../../index').register;
	const processOpenFileDescriptors = require('../../lib/metrics/processOpenFileDescriptors');

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

		processOpenFileDescriptors();

		const metrics = await register.getMetricsAsJSON();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].help).toEqual('Number of open file descriptors.');
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('process_open_fds');
	});
});

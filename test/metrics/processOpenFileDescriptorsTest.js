'use strict';

describe('processOpenFileDescriptors', () => {
	const register = require('../../index').register;
	const processOpenFileDescriptors = require('../../lib/metrics/processOpenFileDescriptors');

	jest.mock(
		'process',
		() =>
			Object.assign({}, jest.requireActual('process'), { platform: 'linux' }) // This metric only works on Linux
	);

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', () => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);

		processOpenFileDescriptors()();

		const metrics = register.getMetricsAsJSON();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].help).toEqual('Number of open file descriptors.');
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('process_open_fds');
	});
});

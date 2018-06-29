'use strict';

describe('processOpenFileDescriptors', () => {
	const sinon = require('sinon');
	const register = require('../../index').register;
	const processOpenFileDescriptors = require('../../lib/metrics/processOpenFileDescriptors');

	const sinonSandbox = sinon.createSandbox();

	beforeAll(() => {
		sinonSandbox.stub(process, 'platform').value('linux'); // This metric only works on Linux
		register.clear();
	});

	afterEach(() => {
		register.clear();
		sinonSandbox.restore();
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

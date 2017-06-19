'use strict';

describe('processHandles', () => {
	const register = require('../../index').register;
	const processHandles = require('../../lib/metrics/processHandles');

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', () => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);

		processHandles()();

		const metrics = register.getMetricsAsJSON();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].help).toEqual('Number of active handles.');
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('nodejs_active_handles_total');
	});
});

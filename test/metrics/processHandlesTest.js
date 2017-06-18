'use strict';

describe('processHandles', function() {
	var register = require('../../index').register;
	var processHandles = require('../../lib/metrics/processHandles');

	beforeAll(function() {
		register.clear();
	});

	afterEach(function() {
		register.clear();
	});

	it('should add metric to the registry', function() {
		expect(register.getMetricsAsJSON()).toHaveLength(0);

		processHandles()();

		var metrics = register.getMetricsAsJSON();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].help).toEqual('Number of active handles.');
		expect(metrics[0].type).toEqual('gauge');
		expect(metrics[0].name).toEqual('nodejs_active_handles_total');
	});
});

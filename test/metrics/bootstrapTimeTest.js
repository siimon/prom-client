'use strict';

describe('bootstrapTime', () => {
	const register = require('../../index').register;
	const processHandles = require('../../lib/metrics/bootstrapTime');

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

		// Check if perf_hooks module is available
		let perf_hooks;
		try {
			// eslint-disable-next-line
			perf_hooks = require('perf_hooks');
		} catch (e) {
			// node version is too old
		}

		if (perf_hooks) {
			expect(metrics).toHaveLength(5);
			expect(metrics[0].help).toEqual('Node process start time(in seconds).');
			expect(metrics[0].type).toEqual('gauge');
			expect(metrics[0].name).toEqual('nodejs_node_start');

			expect(metrics[1].help).toEqual('V8 start time (in seconds).');
			expect(metrics[1].type).toEqual('gauge');
			expect(metrics[1].name).toEqual('nodejs_v8_start');

			expect(metrics[2].help).toEqual(
				'Node.js environment initialization complete time (in seconds).'
			);
			expect(metrics[2].type).toEqual('gauge');
			expect(metrics[2].name).toEqual('nodejs_environment_initialized');

			expect(metrics[3].help).toEqual(
				'Node.js bootstrap complete time (in seconds).'
			);
			expect(metrics[3].type).toEqual('gauge');
			expect(metrics[3].name).toEqual('nodejs_bootstrap_complete');

			expect(metrics[4].help).toEqual(
				'Node.js event loop start time (in seconds).'
			);
			expect(metrics[4].type).toEqual('gauge');
			expect(metrics[4].name).toEqual('nodejs_loop_start');
		} else {
			expect(metrics).toHaveLength(0);
		}
	});
});

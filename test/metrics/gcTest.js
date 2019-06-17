'use strict';

describe('gc', () => {
	const register = require('../../index').register;
	const processHandles = require('../../lib/metrics/gc');

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
			expect(metrics).toHaveLength(2);

			expect(metrics[0].help).toEqual(
				'Count of garbage collections. gc_type label is one of major, minor, incremental or weakcb.'
			);
			expect(metrics[0].type).toEqual('counter');
			expect(metrics[0].name).toEqual('nodejs_gc_runs');

			expect(metrics[1].help).toEqual(
				'Summary of garbage collections. gc_type label is one of major, minor, incremental or weakcb.'
			);
			expect(metrics[1].type).toEqual('summary');
			expect(metrics[1].name).toEqual('nodejs_gc_duration_summary');
		} else {
			expect(metrics).toHaveLength(0);
		}
	});
});

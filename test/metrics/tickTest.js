'use strict';

describe('tick', () => {
	const register = require('../../index').register;
	const tick = require('../../lib/metrics/tick');

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', () => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);

		tick(register, { monitorNextTick: true })();

		const metrics = register.getMetricsAsJSON();

		// Check if perf_hooks module is available
		let perf_hooks;
		let async_hooks;
		try {
			// eslint-disable-next-line
			perf_hooks = require('perf_hooks');
			// eslint-disable-next-line
			async_hooks = require('async_hooks');			
		} catch (e) {
			// node version is too old
		}

		if (perf_hooks && async_hooks) {
			expect(metrics).toHaveLength(2);

			expect(metrics[0].help).toEqual(
				'NO callbacks executed by procecc.nextTick()'
			);
			expect(metrics[0].type).toEqual('counter');
			expect(metrics[0].name).toEqual('nodejs_tick_count');

			expect(metrics[1].help).toEqual(
				'Summary of callbacks executed by procecc.nextTick()'
			);
			expect(metrics[1].type).toEqual('summary');
			expect(metrics[1].name).toEqual('nodejs_tick_duration_summary');
		} else {
			expect(metrics).toHaveLength(0);
		}
	});
});

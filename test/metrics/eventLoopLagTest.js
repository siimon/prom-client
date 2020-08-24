'use strict';

describe('eventLoopLag', () => {
	const register = require('../../index').register;
	const eventLoopLag = require('../../lib/metrics/eventLoopLag');

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', async done => {
		expect(await register.getMetricsAsJSON()).toHaveLength(0);
		eventLoopLag();

		setTimeout(async () => {
			const metrics = await register.getMetricsAsJSON();
			expect(metrics).toHaveLength(8);

			expect(metrics[0].help).toEqual('Lag of event loop in seconds.');
			expect(metrics[0].type).toEqual('gauge');
			expect(metrics[0].name).toEqual('nodejs_eventloop_lag_seconds');

			expect(metrics[1].help).toEqual('The minimum recorded event loop delay.');
			expect(metrics[1].type).toEqual('gauge');
			expect(metrics[1].name).toEqual('nodejs_eventloop_lag_min_seconds');

			expect(metrics[2].help).toEqual('The maximum recorded event loop delay.');
			expect(metrics[2].type).toEqual('gauge');
			expect(metrics[2].name).toEqual('nodejs_eventloop_lag_max_seconds');

			expect(metrics[3].help).toEqual(
				'The mean of the recorded event loop delays.',
			);
			expect(metrics[3].type).toEqual('gauge');
			expect(metrics[3].name).toEqual('nodejs_eventloop_lag_mean_seconds');

			expect(metrics[4].help).toEqual(
				'The standard deviation of the recorded event loop delays.',
			);
			expect(metrics[4].type).toEqual('gauge');
			expect(metrics[4].name).toEqual('nodejs_eventloop_lag_stddev_seconds');

			expect(metrics[5].help).toEqual(
				'The 50th percentile of the recorded event loop delays.',
			);
			expect(metrics[5].type).toEqual('gauge');
			expect(metrics[5].name).toEqual('nodejs_eventloop_lag_p50_seconds');

			expect(metrics[6].help).toEqual(
				'The 90th percentile of the recorded event loop delays.',
			);
			expect(metrics[6].type).toEqual('gauge');
			expect(metrics[6].name).toEqual('nodejs_eventloop_lag_p90_seconds');

			expect(metrics[7].help).toEqual(
				'The 99th percentile of the recorded event loop delays.',
			);
			expect(metrics[7].type).toEqual('gauge');
			expect(metrics[7].name).toEqual('nodejs_eventloop_lag_p99_seconds');

			done();
		}, 5);
	});
});

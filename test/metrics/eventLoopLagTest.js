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

	it('should add metric to the registry', done => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		eventLoopLag()();

		setTimeout(() => {
			const metrics = register.getMetricsAsJSON();
			expect(metrics).toHaveLength(1);

			expect(metrics[0].help).toEqual('Lag of event loop in seconds.');
			expect(metrics[0].type).toEqual('gauge');
			expect(metrics[0].name).toEqual('nodejs_eventloop_lag_seconds');

			done();
		}, 5);
	});
});

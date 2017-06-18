'use strict';

describe('eventLoopLag', function() {
	const register = require('../../index').register;
	const eventLoopLag = require('../../lib/metrics/eventLoopLag');

	beforeAll(function() {
		register.clear();
	});

	afterEach(function() {
		register.clear();
	});

	it('should add metric to the registry', function(done) {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		eventLoopLag()();

		setTimeout(function() {
			const metrics = register.getMetricsAsJSON();
			expect(metrics).toHaveLength(1);

			expect(metrics[0].help).toEqual('Lag of event loop in seconds.');
			expect(metrics[0].type).toEqual('gauge');
			expect(metrics[0].name).toEqual('nodejs_eventloop_lag_seconds');

			done();
		}, 5);
	});
});

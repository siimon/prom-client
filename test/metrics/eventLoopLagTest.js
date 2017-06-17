'use strict';

describe('eventLoopLag', function() {
	const expect = require('chai').expect;
	const register = require('../../index').register;
	const eventLoopLag = require('../../lib/metrics/eventLoopLag');

	before(function() {
		register.clear();
	});

	afterEach(function() {
		register.clear();
	});

	it('should add metric to the registry', function(done) {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		eventLoopLag()();

		setTimeout(function() {
			const metrics = register.getMetricsAsJSON();
			expect(metrics).to.have.length(1);

			expect(metrics[0].help).to.equal('Lag of event loop in seconds.');
			expect(metrics[0].type).to.equal('gauge');
			expect(metrics[0].name).to.equal('nodejs_eventloop_lag_seconds');

			done();
		}, 5);
	});
});

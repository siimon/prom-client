'use strict';

describe('eventLoopLag', () => {
	const expect = require('chai').expect;
	const register = require('../../index').register;
	const eventLoopLag = require('../../lib/metrics/eventLoopLag');

	before(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', (done) => {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		eventLoopLag()();

		setTimeout(() => {
			const metrics = register.getMetricsAsJSON();
			expect(metrics).to.have.length(1);

			expect(metrics[0].help).to.equal('Lag of event loop in seconds.');
			expect(metrics[0].type).to.equal('gauge');
			expect(metrics[0].name).to.equal('nodejs_eventloop_lag_seconds');

			done();
		}, 5);
	});
});

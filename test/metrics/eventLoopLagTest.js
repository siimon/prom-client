'use strict';

describe('eventLoopLag', function() {
	var expect = require('chai').expect;
	var register = require('../../index').register;
	var eventLoopLag = require('../../lib/metrics/eventLoopLag');

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
			var metrics = register.getMetricsAsJSON();
			expect(metrics).to.have.length(1);

			expect(metrics[0].help).to.equal('Lag of event loop in milliseconds.');
			expect(metrics[0].type).to.equal('gauge');
			expect(metrics[0].name).to.equal('node_eventloop_lag_milliseconds');

			done();
		}, 5);
	});
});

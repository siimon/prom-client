'use strict';

describe('processHandles', () => {
	const expect = require('chai').expect;
	const register = require('../../index').register;
	const processHandles = require('../../lib/metrics/processHandles');

	before(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', () => {
		expect(register.getMetricsAsJSON()).to.have.length(0);

		processHandles()();

		const metrics = register.getMetricsAsJSON();

		expect(metrics).to.have.length(1);
		expect(metrics[0].help).to.equal('Number of active handles.');
		expect(metrics[0].type).to.equal('gauge');
		expect(metrics[0].name).to.equal('nodejs_active_handles_total');
	});
});

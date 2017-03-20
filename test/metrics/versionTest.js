'use strict';

var nodeVersion = process.version;
var versionSegments = nodeVersion.slice(1).split('.').map(Number);

describe('version', function() {
	var expect = require('chai').expect;
	var register = require('../../index').register;
	var version = require('../../lib/metrics/version');

	before(function() {
		register.clear();
	});

	afterEach(function() {
		register.clear();
	});

	it('should add metric to the registry', function(done) {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		expect(versionSegments[0]).to.be.a('number');
		expect(versionSegments[1]).to.be.a('number');
		expect(versionSegments[2]).to.be.a('number');

		version()();

		setTimeout(function() {
			var metrics = register.getMetricsAsJSON();
			expect(metrics).to.have.length(1);

			expect(metrics[0].help).to.equal('Node.js version info.');
			expect(metrics[0].type).to.equal('gauge');
			expect(metrics[0].name).to.equal('nodejs_version_info');
			expect(metrics[0].values[0].labels.version).to.equal(nodeVersion);
			expect(metrics[0].values[0].labels.major).to.equal(versionSegments[0]);
			expect(metrics[0].values[0].labels.minor).to.equal(versionSegments[1]);
			expect(metrics[0].values[0].labels.patch).to.equal(versionSegments[2]);

			done();
		}, 5);
	});
});

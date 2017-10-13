'use strict';

const nodeVersion = process.version;
const versionSegments = nodeVersion
	.slice(1)
	.split('.')
	.map(Number);

describe('version', () => {
	const register = require('../../index').register;
	const version = require('../../lib/metrics/version');

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metric to the registry', done => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		expect(typeof versionSegments[0]).toEqual('number');
		expect(typeof versionSegments[1]).toEqual('number');
		expect(typeof versionSegments[2]).toEqual('number');

		version()();

		setTimeout(() => {
			const metrics = register.getMetricsAsJSON();
			expect(metrics).toHaveLength(1);

			expect(metrics[0].help).toEqual('Node.js version info.');
			expect(metrics[0].type).toEqual('gauge');
			expect(metrics[0].name).toEqual('nodejs_version_info');
			expect(metrics[0].values[0].labels.version).toEqual(nodeVersion);
			expect(metrics[0].values[0].labels.major).toEqual(versionSegments[0]);
			expect(metrics[0].values[0].labels.minor).toEqual(versionSegments[1]);
			expect(metrics[0].values[0].labels.patch).toEqual(versionSegments[2]);

			done();
		}, 5);
	});
});

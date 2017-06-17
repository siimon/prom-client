'use strict';

describe('collectDefaultMetrics', () => {
	const expect = require('chai').expect;
	const register = require('../index').register;
	const collectDefaultMetrics = require('../index').collectDefaultMetrics;
	let platform;
	let cpuUsage;
	let interval;

	before(() => {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: function() {
					return { user: 1000, system: 10 };
				}
			});
		} else {
			process.cpuUsage = function() {
				return { user: 1000, system: 10 };
			};
		}

		register.clear();
	});

	after(() => {
		Object.defineProperty(process, 'platform', {
			value: platform
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: cpuUsage
			});
		} else {
			delete process.cpuUsage;
		}
	});

	afterEach(() => {
		register.clear();
		clearInterval(interval);
	});

	it('should add metrics to the registry', () => {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		interval = collectDefaultMetrics();
		expect(register.getMetricsAsJSON()).to.not.have.length(0);
	});

	it('should allow blacklisting all metrics', () => {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		clearInterval(collectDefaultMetrics());
		register.clear();
		expect(register.getMetricsAsJSON()).to.have.length(0);
	});


	describe('disabling', () => {
		it('should not throw error', () => {
			const fn = function() {
				delete require.cache[require.resolve('../index')];
				const client = require('../index');
				clearInterval(client.collectDefaultMetrics());
				register.clear();
			};

			expect(fn).to.not.throw(Error);
		});
	});

});

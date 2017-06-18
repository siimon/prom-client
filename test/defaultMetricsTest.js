'use strict';

describe('collectDefaultMetrics', function() {
	const register = require('../index').register;
	const collectDefaultMetrics = require('../index').collectDefaultMetrics;
	let platform;
	let cpuUsage;
	let interval;

	beforeAll(function() {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});

		if (cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value() {
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

	afterAll(function() {
		Object.defineProperty(process, 'platform', {
			value: platform
		});

		if (cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: cpuUsage
			});
		} else {
			delete process.cpuUsage;
		}
	});

	afterEach(function() {
		register.clear();
		clearInterval(interval);
	});

	it('should add metrics to the registry', function() {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		interval = collectDefaultMetrics();
		expect(register.getMetricsAsJSON()).not.toHaveLength(0);
	});

	it('should allow blacklisting all metrics', function() {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		clearInterval(collectDefaultMetrics());
		register.clear();
		expect(register.getMetricsAsJSON()).toHaveLength(0);
	});

	describe('disabling', function() {
		it('should not throw error', function() {
			const fn = function() {
				delete require.cache[require.resolve('../index')];
				const client = require('../index');
				clearInterval(client.collectDefaultMetrics());
				register.clear();
			};

			expect(fn).not.toThrowError(Error);
		});
	});
});

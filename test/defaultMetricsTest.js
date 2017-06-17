'use strict';

describe('collectDefaultMetrics', () => {
	const register = require('../index').register;
	const collectDefaultMetrics = require('../index').collectDefaultMetrics;
	let platform;
	let cpuUsage;
	let interval;

	beforeAll(() => {
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

	afterAll(() => {
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

	afterEach(() => {
		register.clear();
		clearInterval(interval);
	});

	it('should add metrics to the registry', () => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		interval = collectDefaultMetrics();
		expect(register.getMetricsAsJSON()).not.toHaveLength(0);
	});

	it('should allow blacklisting all metrics', () => {
		expect(register.getMetricsAsJSON()).toHaveLength(0);
		clearInterval(collectDefaultMetrics());
		register.clear();
		expect(register.getMetricsAsJSON()).toHaveLength(0);
	});

	describe('disabling', () => {
		it('should not throw error', () => {
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

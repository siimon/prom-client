'use strict';

describe('collectDefaultMetrics', () => {
	const register = require('../index').register;
	const Registry = require('../index').Registry;
	const collectDefaultMetrics = require('../index').collectDefaultMetrics;
	let platform;
	let cpuUsage;

	beforeAll(() => {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform',
		});

		if (cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value() {
					return { user: 1000, system: 10 };
				},
			});
		} else {
			process.cpuUsage = function () {
				return { user: 1000, system: 10 };
			};
		}

		register.clear();
	});

	afterAll(() => {
		Object.defineProperty(process, 'platform', {
			value: platform,
		});

		if (cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: cpuUsage,
			});
		} else {
			delete process.cpuUsage;
		}
	});

	afterEach(() => {
		register.clear();
	});

	it('should add metrics to the registry', async () => {
		expect(await register.getMetricsAsJSON()).toHaveLength(0);
		collectDefaultMetrics();
		expect(await register.getMetricsAsJSON()).not.toHaveLength(0);
	});

	it('should allow blacklisting all metrics', async () => {
		expect(await register.getMetricsAsJSON()).toHaveLength(0);
		clearInterval(collectDefaultMetrics());
		register.clear();
		expect(await register.getMetricsAsJSON()).toHaveLength(0);
	});

	it('should prefix metric names when configured', async () => {
		collectDefaultMetrics({ prefix: 'some_prefix_' });
		expect(await register.getMetricsAsJSON()).not.toHaveLength(0);
		for (const metric of await register.getMetricsAsJSON()) {
			expect(metric.name.substring(0, 12)).toEqual('some_prefix_');
		}
	});

	describe('disabling', () => {
		it('should not throw error', () => {
			const fn = function () {
				register.clear();
			};

			expect(fn).not.toThrowError(Error);
		});
	});

	describe('custom registry', () => {
		it('should allow to register metrics to custom registry', async () => {
			const registry = new Registry();

			expect(await register.getMetricsAsJSON()).toHaveLength(0);
			expect(await registry.getMetricsAsJSON()).toHaveLength(0);

			collectDefaultMetrics();

			expect(await register.getMetricsAsJSON()).not.toHaveLength(0);
			expect(await registry.getMetricsAsJSON()).toHaveLength(0);

			collectDefaultMetrics({ register: registry });

			expect(await register.getMetricsAsJSON()).not.toHaveLength(0);
			expect(await registry.getMetricsAsJSON()).not.toHaveLength(0);
		});
	});
});

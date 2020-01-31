'use strict';

describe('collectDefaultMetrics', () => {
	const register = require('../index').register;
	const Registry = require('../index').Registry;
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

	it('should prefix metric names when configured', () => {
		interval = collectDefaultMetrics({ prefix: 'some_prefix_' });
		expect(register.getMetricsAsJSON()).not.toHaveLength(0);
		register.getMetricsAsJSON().forEach(metric => {
			expect(metric.name.substring(0, 12)).toEqual('some_prefix_');
		});
	});

	it('should omit timestamp in certain metrics', () => {
		const metricsWithToggableTimestamp = [
			'nodejs_active_handles_total',
			'nodejs_external_memory_bytes',
			'nodejs_heap_size_total_bytes',
			'nodejs_heap_size_used_bytes'
		];
		interval = collectDefaultMetrics({ timestamps: false });
		expect(register.getMetricsAsJSON()).not.toHaveLength(0);
		const testableMetrics = register
			.getMetricsAsJSON()
			.filter(
				metrics => metricsWithToggableTimestamp.indexOf(metrics.name) !== -1
			);
		testableMetrics.forEach(metric => {
			expect(metric.values).not.toHaveLength(0);
			expect(metric.values[0].timestamp).not.toBeDefined();
		});
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

	describe('custom registry', () => {
		it('should allow to register metrics to custom registry', () => {
			const registry = new Registry();

			expect(register.getMetricsAsJSON()).toHaveLength(0);
			expect(registry.getMetricsAsJSON()).toHaveLength(0);

			interval = collectDefaultMetrics({ register: registry });

			expect(register.getMetricsAsJSON()).toHaveLength(0);
			expect(registry.getMetricsAsJSON()).not.toHaveLength(0);
		});
	});
});

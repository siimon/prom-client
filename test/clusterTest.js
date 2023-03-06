'use strict';

const cluster = require('cluster');
const process = require('process');
const Registry = require('../lib/cluster');

describe.each([
	['Prometheus', Registry.PROMETHEUS_CONTENT_TYPE],
	['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE],
])('%s AggregatorRegistry', (tag, regType) => {
	beforeEach(() => {
		Registry.globalRegistry.setContentType(regType);
	});

	it('requiring the cluster should not add any listeners on the cluster module', () => {
		const originalListenerCount = cluster.listenerCount('message');

		require('../lib/cluster');

		expect(cluster.listenerCount('message')).toBe(originalListenerCount);

		jest.resetModules();

		require('../lib/cluster');

		expect(cluster.listenerCount('message')).toBe(originalListenerCount);
	});

	it('requiring the cluster should not add any listeners on the process module', () => {
		const originalListenerCount = process.listenerCount('message');

		require('../lib/cluster');

		expect(process.listenerCount('message')).toBe(originalListenerCount);

		jest.resetModules();

		require('../lib/cluster');

		expect(process.listenerCount('message')).toBe(originalListenerCount);
	});

	describe('aggregatorRegistry.clusterMetrics()', () => {
		it('works properly if there are no cluster workers', async () => {
			const AggregatorRegistry = require('../lib/cluster');
			const ar = new AggregatorRegistry(regType);
			const metrics = await ar.clusterMetrics();
			expect(metrics).toEqual('');
		});
	});

	describe('AggregatorRegistry.aggregate()', () => {
		// These mimic the output of `getMetricsAsJSON`.
		const metricsArr1 = [
			{
				name: 'test_histogram',
				help: 'Example of a histogram',
				type: 'histogram',
				values: [
					{
						labels: { le: 0.1, code: '300' },
						value: 0,
						metricName: 'test_histogram_bucket',
					},
					{
						labels: { le: 10, code: '300' },
						value: 1.6486727018068046,
						metricName: 'test_histogram_bucket',
					},
				],
				aggregator: 'sum',
			},
			{
				help: 'Example of a gauge',
				name: 'test_gauge',
				type: 'gauge',
				values: [
					{ value: 0.47, labels: { method: 'get', code: 200 } },
					{ value: 0.64, labels: {} },
					{ value: 23, labels: { method: 'post', code: '300' } },
				],
				aggregator: 'sum',
			},
			{
				help: 'Start time of the process since unix epoch in seconds.',
				name: 'process_start_time_seconds',
				type: 'gauge',
				values: [{ value: 1502075832, labels: {} }],
				aggregator: 'omit',
			},
			{
				help: 'Lag of event loop in seconds.',
				name: 'nodejs_eventloop_lag_seconds',
				type: 'gauge',
				values: [{ value: 0.009, labels: {} }],
				aggregator: 'average',
			},
			{
				help: 'Node.js version info.',
				name: 'nodejs_version_info',
				type: 'gauge',
				values: [
					{
						value: 1,
						labels: { version: 'v6.11.1', major: 6, minor: 11, patch: 1 },
					},
				],
				aggregator: 'first',
			},
		];
		const metricsArr2 = [
			{
				name: 'test_histogram',
				help: 'Example of a histogram',
				type: 'histogram',
				values: [
					{
						labels: { le: 0.1, code: '300' },
						value: 0.235151,
						metricName: 'test_histogram_bucket',
					},
					{
						labels: { le: 10, code: '300' },
						value: 1.192591,
						metricName: 'test_histogram_bucket',
					},
				],
				aggregator: 'sum',
			},
			{
				help: 'Example of a gauge',
				name: 'test_gauge',
				type: 'gauge',
				values: [
					{ value: 0.02, labels: { method: 'get', code: 200 } },
					{ value: 0.24, labels: {} },
					{ value: 51, labels: { method: 'post', code: '300' } },
				],
				aggregator: 'sum',
			},
			{
				help: 'Start time of the process since unix epoch in seconds.',
				name: 'process_start_time_seconds',
				type: 'gauge',
				values: [{ value: 1502075849, labels: {} }],
				aggregator: 'omit',
			},
			{
				help: 'Lag of event loop in seconds.',
				name: 'nodejs_eventloop_lag_seconds',
				type: 'gauge',
				values: [{ value: 0.008, labels: {} }],
				aggregator: 'average',
			},
			{
				help: 'Node.js version info.',
				name: 'nodejs_version_info',
				type: 'gauge',
				values: [
					{
						value: 1,
						labels: { version: 'v6.11.1', major: 6, minor: 11, patch: 1 },
					},
				],
				aggregator: 'first',
			},
		];

		const aggregated = Registry.aggregate([metricsArr1, metricsArr2], regType);

		it('defaults to summation, preserves histogram bins', async () => {
			const histogram = aggregated.getSingleMetric('test_histogram').get();
			expect(histogram).toEqual({
				name: 'test_histogram',
				help: 'Example of a histogram',
				type: 'histogram',
				values: [
					{
						labels: { le: 0.1, code: '300' },
						value: 0.235151,
						metricName: 'test_histogram_bucket',
					},
					{
						labels: { le: 10, code: '300' },
						value: 2.8412637018068043,
						metricName: 'test_histogram_bucket',
					},
				],
				aggregator: 'sum',
			});
		});

		it('defaults to summation, works for gauges', () => {
			const gauge = aggregated.getSingleMetric('test_gauge').get();
			expect(gauge).toEqual({
				help: 'Example of a gauge',
				name: 'test_gauge',
				type: 'gauge',
				values: [
					{ value: 0.49, labels: { method: 'get', code: 200 } },
					{ value: 0.88, labels: {} },
					{ value: 74, labels: { method: 'post', code: '300' } },
				],
				aggregator: 'sum',
			});
		});

		it('uses `aggregate` method defined for process_start_time', () => {
			const procStartTime = aggregated.getSingleMetric(
				'process_start_time_seconds',
			);
			expect(procStartTime).toBeUndefined();
		});

		it('uses `aggregate` method defined for nodejs_eventloop_lag_seconds', () => {
			const ell = aggregated
				.getSingleMetric('nodejs_eventloop_lag_seconds')
				.get();
			expect(ell).toEqual({
				help: 'Lag of event loop in seconds.',
				name: 'nodejs_eventloop_lag_seconds',
				type: 'gauge',
				values: [{ value: 0.0085, labels: {} }],
				aggregator: 'average',
			});
		});

		it('uses `aggregate` method defined for nodejs_evnetloop_lag_seconds', () => {
			const ell = aggregated
				.getSingleMetric('nodejs_eventloop_lag_seconds')
				.get();
			expect(ell).toEqual({
				help: 'Lag of event loop in seconds.',
				name: 'nodejs_eventloop_lag_seconds',
				type: 'gauge',
				values: [{ value: 0.0085, labels: {} }],
				aggregator: 'average',
			});
		});

		it('uses `aggregate` method defined for nodejs_version_info', () => {
			const version = aggregated.getSingleMetric('nodejs_version_info').get();
			expect(version).toEqual({
				help: 'Node.js version info.',
				name: 'nodejs_version_info',
				type: 'gauge',
				values: [
					{
						value: 1,
						labels: { version: 'v6.11.1', major: 6, minor: 11, patch: 1 },
					},
				],
				aggregator: 'first',
			});
		});
	});
});

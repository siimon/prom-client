'use strict';

const Registry = require('./registry');
const { Grouper } = require('./util');
const { aggregators } = require('./metricAggregators');
const WorkerThreads = require('./workerThreads');
const Cluster = require('./cluster');

class AggregatorRegistry extends Registry {
	constructor() {
		super();

		this.registries = [Registry.globalRegistry];
		this.workerThreads = new WorkerThreads({ registries: this.registries });
		this.cluster = new Cluster({ registries: this.registries });
	}

	setWorkers(workers) {
		this.workerThreads.set(workers);
	}

	clusterMetrics() {
		return this.cluster.getMetrics();
	}

	workerThreadsMetrics() {
		return this.workerThreads.getMetrics();
	}

	/**
	 * Sets the registry or registries to be aggregated. Call from workers to
	 * use a registry/registries other than the default global registry.
	 * @param {Array<Registry>|Registry} registries Registry or registries to be
	 *   aggregated.
	 * @return {void}
	 */
	setRegistries(registries) {
		if (!Array.isArray(registries)) registries = [registries];

		registries.forEach(registry => {
			if (!(registry instanceof Registry)) {
				throw new TypeError(`Expected Registry, got ${typeof registry}`);
			}
		});

		this.registries = registries;
	}

	/**
	 * Creates a new Registry instance from an array of metrics that were
	 * created by `registry.getMetricsAsJSON()`. Metrics are aggregated using
	 * the method specified by their `aggregator` property, or by summation if
	 * `aggregator` is undefined.
	 * @param {Array} metrics Array of metrics, each of which created by
	 *   `registry.getMetricsAsJSON()`.
	 * @return {Registry} aggregated registry.
	 */
	static aggregate(metrics) {
		const aggregatedRegistry = new Registry();
		const metricsByName = new Grouper();

		// Gather by name
		metrics.forEach(m =>
			m.forEach(metric => {
				metricsByName.add(metric.name, metric);
			}),
		);

		// Aggregate gathered metrics.
		metricsByName.forEach(metric => {
			const aggregatorName = metric[0].aggregator;
			const aggregatorFn = aggregators[aggregatorName];

			if (typeof aggregatorFn !== 'function') {
				throw new Error(`'${aggregatorName}' is not a defined aggregator.`);
			}

			const aggregatedMetric = aggregatorFn(metric);
			// NB: The 'omit' aggregator returns undefined.
			if (aggregatedMetric) {
				const aggregatedMetricWrapper = Object.assign(
					{
						get: () => aggregatedMetric,
					},
					aggregatedMetric,
				);
				aggregatedRegistry.registerMetric(aggregatedMetricWrapper);
			}
		});

		return aggregatedRegistry;
	}
}

module.exports = AggregatorRegistry;

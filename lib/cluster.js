'use strict';

/**
 * Extends the Registry class with a `clusterMetrics` method that returns
 * aggregated metrics for all workers.
 *
 * In cluster workers, listens for and responds to requests for metrics by the
 * cluster master.
 */

const cluster = require('cluster');
const Registry = require('./registry');
const Gauge = require('./gauge');
const util = require('./util');
const aggregators = require('./metricAggregators').aggregators;

const GET_METRICS_REQ = 'prom-client:getMetricsReq';
const GET_METRICS_RES = 'prom-client:getMetricsRes';
const REG_METRICS_WORKER = 'prom-client:registerMetricsWorker';

let registries = [Registry.globalRegistry];
let requestCtr = 0; // Concurrency control
let listenersAdded = false;
const coordinatedWorkers = new Set();
const requests = new Map(); // Pending requests for workers' local metrics.

class AggregatorRegistry extends Registry {
	/**
     Create an AggregatorRegistry instance. Accepts an optional `options` object.

     Options are:
        coordinated If false (default), request metrics from all cluster workers. If true, request metrics only from workers that have required prom-client.
	 * @param {object?} options object
	 */
	constructor({ coordinated } = {}) {
		super();
		this.coordinated = coordinated || false;
		addListeners();
	}

	/**
	 * Gets aggregated metrics for all workers. The optional callback and
	 * returned Promise resolve with the same value; either may be used.
	 * @param {Function?} callback (err, metrics) => any
	 * @return {Promise<string>} Promise that resolves with the aggregated
	 *	 metrics.
	 */
	clusterMetrics(callback) {
		const requestId = requestCtr++;

		return new Promise((resolve, reject) => {
			const nWorkers = this.coordinated
				? coordinatedWorkers.size
				: Object.keys(cluster.workers).length;

			function done(err, result) {
				// Don't resolve/reject the promise if a callback is provided
				if (typeof callback === 'function') {
					callback(err, result);
				} else {
					if (err) reject(err);
					else resolve(result);
				}
			}

			if (nWorkers === 0) {
				return process.nextTick(() => done(null, ''));
			}

			const request = {
				responses: [],
				workerCount: nWorkers,
				pending: nWorkers,
				done,
				errorTimeout: setTimeout(() => {
					request.failed = true;
					const err = new Error('Operation timed out.');
					request.done(err);
				}, 5000),
				failed: false
			};
			requests.set(requestId, request);

			const message = {
				type: GET_METRICS_REQ,
				requestId
			};
			const workers = this.coordinated
				? coordinatedWorkers
				: Object.keys(cluster.workers);
			for (const id of workers) {
				const worker = cluster.workers[id];
				if (worker === undefined || worker.isDead() || !worker.isConnected()) {
					request.pending--;
					request.workerCount--;
					coordinatedWorkers.delete(id); // Set is safe to mutate while iterating
				} else {
					worker.send(message);
				}
			}
		});
	}

	/**
	 * Creates a new Registry instance from an array of metrics that were
	 * created by `registry.getMetricsAsJSON()`. Metrics are aggregated using
	 * the method specified by their `aggregator` property, or by summation if
	 * `aggregator` is undefined.
	 * @param {Array} metricsArr Array of metrics, each of which created by
	 *	 `registry.getMetricsAsJSON()`.
	 * @return {Registry} aggregated registry.
	 */
	static aggregate(metricsArr) {
		const aggregatedRegistry = new Registry();
		const metricsByName = new util.Grouper();

		// Gather by name
		metricsArr.forEach(metrics => {
			metrics.forEach(metric => {
				metricsByName.add(metric.name, metric);
			});
		});

		// Aggregate gathered metrics.
		metricsByName.forEach(metrics => {
			const aggregatorName = metrics[0].aggregator;
			const aggregatorFn = aggregators[aggregatorName];
			if (typeof aggregatorFn !== 'function') {
				throw new Error(`'${aggregatorName}' is not a defined aggregator.`);
			}
			const aggregatedMetric = aggregatorFn(metrics);
			// NB: The 'omit' aggregator returns undefined.
			if (aggregatedMetric) {
				const aggregatedMetricWrapper = Object.assign(
					{
						get: () => aggregatedMetric
					},
					aggregatedMetric
				);
				aggregatedRegistry.registerMetric(aggregatedMetricWrapper);
			}
		});

		return aggregatedRegistry;
	}

	/**
	 * Sets the registry or registries to be aggregated. Call from workers to
	 * use a registry/registries other than the default global registry.
	 * @param {Array<Registry>|Registry} regs Registry or registries to be
	 *	 aggregated.
	 * @return {void}
	 */
	static setRegistries(regs) {
		if (!Array.isArray(regs)) regs = [regs];
		regs.forEach(reg => {
			if (!(reg instanceof Registry)) {
				throw new TypeError(`Expected Registry, got ${typeof reg}`);
			}
		});
		registries = regs;
	}
}

/**
 * Adds event listeners for cluster aggregation. Idempotent (safe to call more
 * than once).
 * @return {void}
 */
function addListeners() {
	if (listenersAdded) return;
	listenersAdded = true;

	if (cluster.isMaster) {
		// Listen for worker responses to requests for local metrics
		cluster.on('message', function(worker, message) {
			if (arguments.length === 2) {
				// pre-Node.js v6.0
				message = worker;
				worker = undefined;
			}

			if (message.type === GET_METRICS_RES) {
				const request = requests.get(message.requestId);
				message.metrics.forEach(registry => request.responses.push(registry));
				request.pending--;

				if (request.pending === 0) {
					// finalize
					requests.delete(message.requestId);
					clearTimeout(request.errorTimeout);

					if (request.failed) return; // Callback already run with Error.

					const registry = AggregatorRegistry.aggregate(request.responses);
					const g = new Gauge({
						name: 'nodejs_prom_client_cluster_workers',
						help: 'Number of connected cluster workers reporting to prometheus',
						registers: [registry]
					});
					g.set(request.workerCount);
					const promString = registry.metrics();
					request.done(null, promString);
				}
			} else if (message.type === REG_METRICS_WORKER) {
				//setup coordinated workers
				const workerId = message.workerId;
				coordinatedWorkers.add(workerId);
			}
		});
	}
}

if (cluster.isWorker) {
	// Respond to master's requests for worker's local metrics.
	process.on('message', message => {
		if (message.type === GET_METRICS_REQ) {
			process.send({
				type: GET_METRICS_RES,
				requestId: message.requestId,
				metrics: registries.map(r => r.getMetricsAsJSON())
			});
		}
	});

	process.send({
		type: REG_METRICS_WORKER,
		workerId: cluster.worker.id
	});
}

module.exports = AggregatorRegistry;

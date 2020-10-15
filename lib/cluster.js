'use strict';

/**
 * Extends the Registry class with a `clusterMetrics` method that returns
 * aggregated metrics for all workers.
 *
 * In cluster workers, listens for and responds to requests for metrics by the
 * cluster master.
 */

const Registry = require('./registry');
const { Grouper } = require('./util');
const { aggregators } = require('./metricAggregators');

let parentPort, MessageChannel, isMainThread, Worker;
try {
	/* eslint-disable node/no-unsupported-features/node-builtins */
	const worker_threads = require('worker_threads');

	parentPort = worker_threads.parentPort;
	MessageChannel = worker_threads.MessageChannel;
	isMainThread = worker_threads.isMainThread;
	Worker = worker_threads.Worker;
} catch {
	// node version is too old
}

// We need to lazy-load the 'cluster' module as some application servers -
// namely Passenger - crash when it is imported.
let cluster = () => {
	const data = require('cluster');
	cluster = () => data;
	return data;
};

const GET_METRICS_REQ = 'prom-client:getMetricsReq';
const GET_METRICS_RES = 'prom-client:getMetricsRes';

let registries = [Registry.globalRegistry];
let requestCtr = 0; // Concurrency control
let listenersAdded = false;
const workersQueue = [];
const requests = new Map(); // Pending requests for workers' local metrics.

class AggregatorRegistry extends Registry {
	constructor() {
		super();
		addListeners();
	}

	attachWorkers(workers = []) {
		for (const worker in workers) {
			if (worker instanceof Worker) {
				workersQueue.push(worker);
			}
		}
	}

	/**
	 * Gets aggregated metrics for all workers. The optional callback and
	 * returned Promise resolve with the same value; either may be used.
	 * @return {Promise<string>} Promise that resolves with the aggregated
	 *   metrics.
	 */
	clusterMetrics() {
		const requestId = requestCtr++;

		return new Promise((resolve, reject) => {
			let settled = false;
			function done(err, result) {
				if (settled) return;
				settled = true;
				if (err) reject(err);
				else resolve(result);
			}

			const request = {
				responses: [],
				pending: 0,
				done,
				errorTimeout: setTimeout(() => {
					const err = new Error('Operation timed out.');
					request.done(err);
				}, 5000),
			};
			requests.set(requestId, request);

			const message = {
				type: GET_METRICS_REQ,
				requestId,
			};

			for (const id in cluster().workers) {
				// If the worker exits abruptly, it may still be in the workers
				// list but not able to communicate.
				if (cluster().workers[id].isConnected()) {
					cluster().workers[id].send(message);
					request.pending++;
				}
			}

			getWorkerThreadsMetrics(message);
			request.pending += workersQueue.length || 0;

			if (request.pending === 0) {
				// No workers were up
				clearTimeout(request.errorTimeout);
				process.nextTick(() => done(null, ''));
			}
		});
	}

	/**
	 * Creates a new Registry instance from an array of metrics that were
	 * created by `registry.getMetricsAsJSON()`. Metrics are aggregated using
	 * the method specified by their `aggregator` property, or by summation if
	 * `aggregator` is undefined.
	 * @param {Array} metricsArr Array of metrics, each of which created by
	 *   `registry.getMetricsAsJSON()`.
	 * @return {Registry} aggregated registry.
	 */
	static aggregate(metricsArr) {
		const aggregatedRegistry = new Registry();
		const metricsByName = new Grouper();

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
						get: () => aggregatedMetric,
					},
					aggregatedMetric,
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
	 *   aggregated.
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

function handleWorkerResponse(worker, message) {
	if (message.type === GET_METRICS_RES) {
		const request = requests.get(message.requestId);
		request.pending += message.workerRequests || 0;

		if (message.error) {
			request.done(new Error(message.error));
			return;
		}

		message.metrics.forEach(registry => request.responses.push(registry));
		request.pending--;

		if (request.pending === 0) {
			// finalize
			requests.delete(message.requestId);
			clearTimeout(request.errorTimeout);

			const registry = AggregatorRegistry.aggregate(request.responses);
			const promString = registry.metrics();
			request.done(null, promString);
		}
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

	if (cluster().isMaster) {
		// Listen for cluster responses to requests for local metrics
		cluster().on('message', handleWorkerResponse);
	}
}

function getWorkerThreadsMetrics(message) {
	workersQueue.forEach(worker => {
		if (worker && worker instanceof Worker) {
			const metricsChannel = new MessageChannel();

			worker.postMessage(
				{
					...message,
					port: metricsChannel.port1,
				},
				[metricsChannel.port1],
			);

			metricsChannel.port2.on('message', response => {
				if (response.type === GET_METRICS_RES) {
					if (cluster().isWorker) {
						process.send(response);
					}

					if (cluster().isMaster) {
						handleWorkerResponse(worker, response);
					}

					metricsChannel.port2.close();
				}
			});
		}
	});
}

// Respond to master's requests for worker's local metrics.
process.on('message', message => {
	if (cluster().isWorker && message.type === GET_METRICS_REQ) {
		getWorkerThreadsMetrics(message);

		Promise.all(registries.map(r => r.getMetricsAsJSON()))
			.then(metrics => {
				process.send({
					type: GET_METRICS_RES,
					requestId: message.requestId,
					metrics,
					workerRequests: workersQueue.length,
				});
			})
			.catch(error => {
				process.send({
					type: GET_METRICS_RES,
					requestId: message.requestId,
					error: error.message,
				});
			});
	}
});

// Respond to master's request for worker_threads worker local metrics
if (!isMainThread) {
	parentPort.on('message', ({ type, requestId, port } = {}) => {
		if (type === GET_METRICS_REQ) {
			Promise.all(registries.map(r => r.getMetricsAsJSON()))
				.then(metrics => {
					port.postMessage({
						type: GET_METRICS_RES,
						requestId,
						metrics,
					});
				})
				.catch(error => {
					port.postMessage({
						type: GET_METRICS_RES,
						requestId,
						error: error.message,
					});
				});
		}
	});
}

module.exports = AggregatorRegistry;

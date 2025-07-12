'use strict';

/**
 * Extends the Registry class with a `workerMetrics` method that returns
 * aggregated metrics for all workers.
 *
 * In workers, listens for and responds to requests for metrics by the
 * main thread.
 */

const Registry = require('./registry');
const { isMainThread, parentPort } = require('node:worker_threads');

const GET_METRICS_REQ = 'prom-client:getMetricsReq';
const GET_METRICS_RES = 'prom-client:getMetricsRes';

let registries = [Registry.globalRegistry];
let requestCtr = 0; // Concurrency control
let listenersAdded = false;
const requests = new Map(); // Pending requests for workers' local metrics.

class AggregatorRegistry extends Registry {
	constructor(regContentType = Registry.PROMETHEUS_CONTENT_TYPE) {
		super(regContentType);
		this.workers = new Set();
		addListeners();
	}

	/**
	 * Add a worker to the aggregation list.
	 * Whereas clusters are a top-level activity, multiple modules may start their
	 * own workers and require telemetry collection.
	 * @param	worker {Worker}
	 */
	addWorker(worker) {
		this.workers.add(worker);

		worker.on('error', err => {
			console.error(err);
		});

		worker.on('exit', code => {
			if (code !== 0) {
				console.error(new Error(`Worker stopped with exit code ${code}`));
			}

			this.workers.delete(worker);
		});

		// Listen for worker responses to requests for local metrics
		worker.on('message', message => {
			if (message.type === GET_METRICS_RES) {
				const request = requests.get(message.requestId);

				if (request === undefined) {
					return;
				}

				if (message.error) {
					request.done(new Error(message.error));
					return;
				}

				message.metrics.forEach(metric => request.responses.push(metric));
				request.pending--;

				if (request.pending === 0) {
					// finalize
					clearTimeout(request.errorTimeout);

					const registry = Registry.aggregate(request.responses);
					const promString = registry.metrics();
					request.done(undefined, promString);
				}
			}
		});
	}

	/**
	 * Gets aggregated metrics for all workers. The optional callback and
	 * returned Promise resolve with the same value; either may be used.
	 * @returns {Promise<string>} Promise that resolves with the aggregated
	 *   metrics.
	 */
	workerMetrics() {
		const requestId = requestCtr++;

		return new Promise((resolve, reject) => {
			let settled = false;
			function done(err, result) {
				if (settled) return;
				settled = true;

				requests.delete(requestId);

				if (err !== undefined) {
					reject(err);
				} else {
					resolve(result);
				}
			}

			const request = {
				responses: [],
				pending: 0,
				done,
				errorTimeout: setTimeout(() => {
					const err = new Error('Operation timed out.');
					request.done(err);
				}, 50_000),
			};
			requests.set(requestId, request);

			const message = {
				type: GET_METRICS_REQ,
				requestId,
			};

			for (const worker of this.workers) {
				// If the worker exits abruptly, it may still be in the workers
				// list but not able to communicate.
				worker.postMessage(message);
				request.pending++;
			}

			if (request.pending === 0) {
				// No workers were up
				clearTimeout(request.errorTimeout);
				process.nextTick(() => done(undefined, ''));
			}
		});
	}

	get contentType() {
		return super.contentType;
	}

	/**
	 * Creates a new Registry instance from an array of metrics that were
	 * created by `registry.getMetricsAsJSON()`. Metrics are aggregated using
	 * the method specified by their `aggregator` property, or by summation if
	 * `aggregator` is undefined.
	 * @param {Array} metricsArr Array of metrics, each of which created by
	 *   `registry.getMetricsAsJSON()`.
	 * @param {string} registryType content type of the new registry. Defaults
	 * to PROMETHEUS_CONTENT_TYPE.
	 * @returns {Registry} aggregated registry.
	 */
	static aggregate(
		metricsArr,
		registryType = Registry.PROMETHEUS_CONTENT_TYPE,
	) {
		return Registry.aggregate(metricsArr, registryType);
	}

	/**
	 * Sets the registry or registries to be aggregated. Call from workers to
	 * use a registry/registries other than the default global registry.
	 * @param {Array<Registry>|Registry} regs Registry or registries to be
	 *   aggregated.
	 * @returns {void}
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
 * Adds event listeners for worker aggregation. Idempotent (safe to call more
 * than once).
 * @returns {void}
 */
function addListeners() {
	if (listenersAdded) return;
	listenersAdded = true;

	if (!isMainThread) {
		parentPort.on('message', async message => {
			if (message.type === GET_METRICS_REQ) {
				const metrics = await Promise.all(
					registries.map(r => r.getMetricsAsJSON()),
				);

				try {
					parentPort.postMessage({
						type: GET_METRICS_RES,
						requestId: message.requestId,
						metrics,
					});
				} catch (error) {
					parentPort.postMessage({
						type: GET_METRICS_RES,
						requestId: message.requestId,
						error: error.message,
					});
				}
			}
		});
	}
}

module.exports = AggregatorRegistry;

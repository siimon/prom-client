'use strict';

const AggregatorRegistry = require('./aggregatorRegistry');

const GET_METRICS_REQ = 'prom-client:getMetricsReq';
const GET_METRICS_RES = 'prom-client:getMetricsRes';

class RequestQueue {
	constructor() {
		this.requests = new Map();
		this.counter = 0;
	}

	init(callback) {
		const requestId = this.counter++;

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
					const error = new Error('Operation timed out.');
					request.done(error);
				}, 5000),
			};
			this.requests.set(requestId, request);

			const message = {
				type: GET_METRICS_REQ,
				requestId,
			};

			callback(message, request);

			if (request.pending === 0) {
				// No workers were up
				clearTimeout(request.errorTimeout);
				process.nextTick(() => done(null, ''));
			}
		});
	}

	handleResponse(message) {
		if (message.type === GET_METRICS_RES) {
			const request = this.requests.get(message.requestId);

			if (message.error) {
				request.done(new Error(message.error));
				return;
			}

			message.metrics.forEach(registry => request.responses.push(registry));
			request.pending--;

			if (request.pending === 0) {
				// finalize
				this.requests.delete(message.requestId);
				clearTimeout(request.errorTimeout);

				const registry = AggregatorRegistry.aggregate(request.responses);
				const metrics = registry.metrics();
				request.done(null, metrics);
			}
		}
	}

	sendResponse(registries, message, callback) {
		if (message.type === GET_METRICS_REQ) {
			Promise.all(registries.map(r => r.getMetricsAsJSON()))
				.then(metrics => {
					callback({
						type: GET_METRICS_RES,
						requestId: message.requestId,
						metrics,
					});
				})
				.catch(error => {
					callback({
						type: GET_METRICS_RES,
						requestId: message.requestId,
						error: error.message,
					});
				});
		}
	}
}

module.exports = RequestQueue;

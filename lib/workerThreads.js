'use strict';

const RequestQueue = require('./requestQueue');
const REQUIRE_NODE = 'required Node version for worker_threads is 11 or higher';
/* eslint-disable node/no-unsupported-features/node-builtins */
let worker_threads = { parentPort: { on: () => {} } };
try {
	worker_threads = require('worker_threads');
} catch {
	console.log(REQUIRE_NODE);
}

const { Worker, isMainThread, parentPort, MessageChannel } = worker_threads;

class WorkerThreads {
	constructor({ registries, workers = [] } = {}) {
		this.registries = registries;
		this.requests = new RequestQueue();
		this.workers = workers;

		this.onInit();
	}

	onInit() {
		if (this._isListenersAttached) {
			return;
		}

		this.attachWorkerListeners();

		this._isListenersAttached = true;
	}

	attachWorkerListeners() {
		if (isMainThread) {
			return;
		}

		parentPort.on('message', message => {
			this.requests.sendResponse(
				this.registries,
				message,
				message.port.postMessage,
			);
		});
	}

	getMetrics() {
		if (!MessageChannel) {
			throw Error(REQUIRE_NODE);
		}

		return this.requests.init((message, request) => {
			this.workers.forEach(worker => {
				if (worker && worker instanceof Worker) {
					const metricsChannel = new MessageChannel();

					worker.postMessage({ ...message, port: metricsChannel.port1 }, [
						metricsChannel.port1,
					]);
					request.pending++;

					metricsChannel.port2.on('message', response => {
						this.requests.handleResponse(response);

						metricsChannel.port2.close();
					});
				}
			});
		});
	}
}

module.exports = WorkerThreads;

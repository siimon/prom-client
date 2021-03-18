'use strict';

const RequestQueue = require('./requestQueue');

// We need to lazy-load the 'cluster' module as some application servers -
// namely Passenger - crash when it is imported.
let cluster = () => {
	const data = require('cluster');
	cluster = () => data;
	return data;
};

class Cluster {
	constructor({ registries } = {}) {
		this.registries = registries;
		this.requests = new RequestQueue();

		this.onInit();
	}

	onInit() {
		if (this._isListenersAttached) {
			return;
		}

		this.attachMasterListeners();
		this.attachWorkerListeners();

		this._isListenersAttached = true;
	}

	attachMasterListeners() {
		if (!cluster().isMaster) {
			return;
		}

		cluster().on('message', (worker, message) => {
			this.requests.handleResponse(message);
		});
	}

	attachWorkerListeners() {
		if (!cluster().isWorker) {
			return;
		}

		process.on('message', message => {
			this.requests.sendResponse(this.registries, message, process.send);
		});
	}

	getMetrics() {
		return this.requests.init((message, request) => {
			for (const id in cluster().workers) {
				// If the worker exits abruptly, it may still be in the workers
				// list but not able to communicate.
				if (cluster().workers[id].isConnected()) {
					cluster().workers[id].send(message);
					request.pending++;
				}
			}
		});
	}
}

module.exports = Cluster;

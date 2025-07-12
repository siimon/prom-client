'use strict';

const Path = require('path');
const { Worker, isMainThread } = require('node:worker_threads');
const express = require('express');
const metricsServer = express();
const WorkerRegistry = require('../').WorkerRegistry;
const workerRegistry = new WorkerRegistry();

if (isMainThread) {
	for (let i = 1; i <= 4; i++) {
		const opts = { env: { ...process.env, PORT: 3000 + i } };
		const worker = new Worker(Path.join(__filename), opts);

		workerRegistry.addWorker(worker);
	}

	metricsServer.get('/cluster_metrics', async (req, res) => {
		try {
			const metrics = await workerRegistry.workerMetrics();
			res.set('Content-Type', workerRegistry.contentType);
			res.send(metrics);
		} catch (ex) {
			res.statusCode = 500;
			res.send(ex.message);
		}
	});

	metricsServer.listen(3000);
	console.log(
		'Cluster metrics server listening to 3000, metrics exposed on /cluster_metrics',
	);
} else {
	require('./server.js');
}

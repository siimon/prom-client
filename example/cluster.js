'use strict';

const cluster = require('cluster');
const express = require('express');
const prometheus = require('../');

if (cluster.isMaster) {
	// Instantiate an AggregatorRegistry in the cluster master.
	const aggregatorRegistry = new prometheus.AggregatorRegistry();

	for (let i = 0; i < 4; i++) {
		cluster.fork();
	}

	const metricsServer = express();
	metricsServer.get('/cluster_metrics', async (req, res) => {
		try {
			// Aggregate metrics across all workers.
			const metrics = await aggregatorRegistry.clusterMetrics();
			res.set('Content-Type', aggregatorRegistry.contentType);
			res.send(metrics);
		} catch (ex) {
			res.statusCode = 500;
			res.send(ex.message);
		}
	});

	metricsServer.listen(3001);
	console.log(
		'Cluster metrics server listening to 3001, metrics exposed on /cluster_metrics',
	);
} else {
	// Set up the cluster worker.
	prometheus.setupClusterWorker();
	// Register metrics as usual.
	require('./server.js');
}

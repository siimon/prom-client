'use strict';

const cluster = require('cluster');
const express = require('express');
const metricsServer = express();
const AggregatorRegistry = require('../').AggregatorRegistry;

// Create performance optimized AggregatorRegistry
// Uses file based communication for metrics flow from workers to master and requires access to /tmp folder
const aggregatorRegistry = new AggregatorRegistry(undefined, {
	performanceOptimizedVarient: true,
});

if (cluster.isMaster) {
	for (let i = 0; i < 4; i++) {
		cluster.fork();
	}

	metricsServer.get('/cluster_metrics', async (req, res) => {
		try {
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
	require('./server.js');
}

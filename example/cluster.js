'use strict';

const cluster = require('cluster');
const express = require('express');
const metricsServer = express();
const AggregatorRegistry = require('../').AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();

if (cluster.isPrimary) {
	for (let i = 1; i <= 4; i++) {
		cluster.fork({ ...process.env, PORT: 3000 + i });
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

	metricsServer.listen(3000);
	console.log(
		'Cluster metrics server listening to 3000, metrics exposed on /cluster_metrics',
	);
} else {
	require('./server.js');
}

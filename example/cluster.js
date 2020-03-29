'use strict';

const cluster = require('cluster');
const express = require('express');
const metricsServer = express();
const AggregatorRegistry = require('../').AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();

if (cluster.isMaster) {
	for (let i = 0; i < 4; i++) {
		cluster.fork();
	}

	metricsServer.get('/cluster_metrics', (req, res) => {
		aggregatorRegistry.clusterMetrics((err, metrics) => {
			if (err) console.log(err);
			res.set('Content-Type', aggregatorRegistry.contentType);
			res.send(metrics);
		});
	});

	metricsServer.listen(3001);
	console.log(
		'Cluster metrics server listening to 3001, metrics exposed on /cluster_metrics',
	);
} else {
	require('./server.js');
}

'use strict';

const express = require('express');
const metricsServer = express();
const AggregatorRegistry = require('../').AggregatorRegistry;
/* eslint-disable node/no-unsupported-features/node-builtins */
const { Worker, isMainThread } = require('worker_threads');

const aggregatorRegistry = new AggregatorRegistry();

if (isMainThread) {
	metricsServer.get('/metrics', async (req, res) => {
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

	const worker = new Worker(__filename);

	aggregatorRegistry.attachWorkers([worker]);
} else {
	const Histogram = require('../').Histogram;
	const h = new Histogram({
		name: 'test_histogram',
		help: 'Example of a histogram',
		labelNames: ['code'],
	});

	h.labels('200').observe(Math.random());
}

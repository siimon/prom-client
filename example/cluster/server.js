'use strict';

const express = require('express');
const { Counter } = require('../..');
const AggregatorRegistry = require('../..').AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();
const PORT = 3000;

const http_request_total = new Counter({
	name: 'http_request_total',
	help: 'request count | clusterId="20212" statusCode="2xx|4xx|5xx"',
	labelNames: ['clusterId', 'statusCode'],
});

module.exports = (options = {}) => {
	const {
		metrics: { contentType = '' },
	} = options;

	const app = express();

	app.get('/', (req, res) => {
		http_request_total.inc({ clusterId: process.pid, statusCode: 200 });

		res.send('OK');
	});

	app.get('/metrics', async (req, res) => {
		const metrics = await aggregatorRegistry.clusterMetrics();

		res.set('Content-Type', contentType);
		res.send(metrics);
	});

	app.listen(PORT, () => {
		console.log(`cluster: #${process.pid} - listening on port ${PORT}`);
	});
};

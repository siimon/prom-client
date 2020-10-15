'use strict';

const express = require('express');
const { Counter } = require('../..');
const AggregatorRegistry = require('../..').AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();
const worker = require('./worker');
const PORT = 3000;

const http_request_total = new Counter({
	name: 'http_request_total',
	help: 'request count | statusCode="2xx|4xx|5xx"',
	labelNames: ['statusCode'],
});

const app = express();

app.get('/', async (req, res) => {
	http_request_total.inc({ statusCode: 200 });
	const result = await worker();

	res.send(result);
});

app.get('/metrics', async (req, res) => {
	const metrics = await aggregatorRegistry.workersMetrics();

	res.set('Content-Type', aggregatorRegistry.contentType);
	res.send(metrics);
});

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});

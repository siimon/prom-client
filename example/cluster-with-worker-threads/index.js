'use strict';

const cluster = require('cluster');
const server = require('./server');

const AggregatorRegistry = require('../..').AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	for (let i = 0; i < 2; i++) {
		cluster.fork();
	}

	cluster.on('exit', worker => {
		console.log(`worker ${worker.process.pid} died`);
		console.log("Let's fork another worker!");
		cluster.fork();
	});
} else {
	server({
		metrics: {
			contentType: aggregatorRegistry.contentType,
		},
	});
}

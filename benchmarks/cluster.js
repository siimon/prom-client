'use strict';

const { getLabelCombinations } = require('./utils/labels');

module.exports = setupClusterSuite;

function setupClusterSuite(suite) {
	suite.add(
		`aggregate()`,
		(client, data) => client.AggregatorRegistry.aggregate(data),
		{ setup },
	);
}

async function setup(client) {
	const { Counter, Histogram, Registry } = client;
	const registers = new Array(8).fill(0).map(() => new Registry());

	const labelNames =
		'single letter labels make poor approximations of real label interpolation behavior for real metrics'.split(
			' ',
		);

	const counter = new Counter({
		name: 'counter',
		help: 'counter',
		labelNames,
		registers,
	});

	const histogram = new Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames,
		registers,
	});

	const combinations = getLabelCombinations(
		[3, 5, 2, 4, 8, 7, 1, 3],
		labelNames,
	);

	for (const labels of combinations) {
		counter.inc(labels, 1);
		histogram.observe(labels, 1);
	}

	const results = [];

	for (const registry of registers) {
		results.push(await registry.getMetricsAsJSON());
	}

	return results.concat(results);
}

'use strict';

module.exports = setupHistogramSuite;

function setupHistogramSuite(suite) {
	suite.add(
		'observe',
		(client, histogram) => histogram.observe(1, { a: 1, b: 1 }),
		{ setup }
	);
}

function setup(client) {
	const registry = new client.Registry();

	const histogram = new client.Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames: ['a', 'b'],
		registers: [registry]
	});

	return histogram;
}

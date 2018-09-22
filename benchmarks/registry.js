'use strict';

module.exports = setupRegistrySuite;

function setupRegistrySuite(suite) {
	suite.add(
		'getMetricsAsJSON',
		(client, registry) => registry.getMetricsAsJSON(),
		{ setup }
	);
	suite.add('metrics', (client, registry) => registry.metrics(), { setup });
}

function setup(client) {
	const registry = new client.Registry();

	const histogram = new client.Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames: ['a', 'b'],
		registers: [registry]
	});

	histogram.observe(1, { a: 1, b: 1 });

	return registry;
}

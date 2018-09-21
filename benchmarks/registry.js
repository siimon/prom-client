'use strict';

module.exports = setupRegistrySuite;

function setupRegistrySuite(client, { add }) {
	const registry = new client.Registry();

	const histogram = new client.Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames: ['a', 'b'],
		registers: [registry]
	});

	histogram.observe(1, { a: 1, b: 1 });

	add('getMetricsAsJSON', () => {
		registry.getMetricsAsJSON();
	});

	add('metrics', () => {
		registry.metrics();
	});
}

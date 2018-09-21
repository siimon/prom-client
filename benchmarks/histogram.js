'use strict';

module.exports = setupHistogramSuite;

function setupHistogramSuite(client, { add }) {
	const registry = new client.Registry();

	const histogram = new client.Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames: ['a', 'b'],
		registers: [registry]
	});

	add('observe', () => {
		histogram.observe(1, { a: 1, b: 1 });
	});
}

'use strict';

module.exports = setupHistogramSuite;

function setupHistogramSuite(client, { add }) {
	const registry = new client.Registry();

	const histogram = new client.Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames: ['a', 'b', 'c', 'd'],
		registers: [registry]
	});

	let value = 0;
	let a = 0;
	let b = 0;
	let c = 0;
	let d = 0;

	add('observe', () => {
		histogram.observe(value++, {
			a: a++,
			b: b++,
			c: c++,
			d: d++
		});
	});
}

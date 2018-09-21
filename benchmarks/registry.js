'use strict';

const _ = require('lodash');

module.exports = setupRegistrySuite;

function setupRegistrySuite(client, { add }) {
	const registry = new client.Registry();

	const histogram = new client.Histogram({
		name: 'histogram',
		help: 'histogram',
		labelNames: ['a', 'b', 'c', 'd'],
		registers: [registry]
	});

	const labelValueCount = 2;
	_.times(labelValueCount, a => {
		_.times(labelValueCount, b => {
			_.times(labelValueCount, c => {
				_.times(labelValueCount, d => {
					const end = histogram.startTimer();

					end({ a, b, c, d });
				});
			});
		});
	});

	add('getMetricsAsJSON', () => {
		registry.getMetricsAsJSON();
	});

	add('metrics', () => {
		registry.metrics();
	});
}

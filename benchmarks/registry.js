'use strict';

const { getLabelNames, getLabelCombinations } = require('./utils/labels');

module.exports = setupRegistrySuite;

function setupRegistrySuite(suite) {
	const labelSetups = [
		{ name: '1 with 64', counts: [64] },
		{ name: '2 with 8', counts: [8, 8] },
		{ name: '2 with 4 and 2 with 2', counts: [4, 4, 2, 2] },
		{ name: '2 with 2 and 2 with 4', counts: [2, 2, 4, 4] },
		{ name: '6 with 2', counts: [2, 2, 2, 2, 2, 2] }
	];

	labelSetups.forEach(({ name, counts }) => {
		suite.add(
			`getMetricsAsJSON#${name}`,
			(client, registry) => registry.getMetricsAsJSON(),
			{ setup: setup(counts) }
		);
	});

	labelSetups.forEach(({ name, counts }) => {
		suite.add(`metrics#${name}`, (client, registry) => registry.metrics(), {
			setup: setup(counts)
		});
	});
}

function setup(labelCounts) {
	return client => {
		const registry = new client.Registry();

		const histogram = new client.Histogram({
			name: 'histogram',
			help: 'histogram',
			labelNames: getLabelNames(labelCounts.length),
			registers: [registry]
		});

		const labelCombinations = getLabelCombinations(labelCounts);

		labelCombinations.forEach(labels => histogram.observe(labels, 1));

		return registry;
	};
}

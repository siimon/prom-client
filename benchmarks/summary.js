'use strict';

const { getLabelNames, labelCombinationFactory } = require('./utils/labels');

module.exports = setupSummarySuite;

function setupSummarySuite(suite) {
	suite.add(
		'observe#1 with 64',
		labelCombinationFactory([64], (client, { summary }, labels) =>
			summary.observe(labels, 1),
		),
		{ teardown, setup: setup(1) },
	);

	suite.add(
		'observe#2 with 8',
		labelCombinationFactory([8, 8], (client, { summary }, labels) =>
			summary.observe(labels, 1),
		),
		{ teardown, setup: setup(2) },
	);

	suite.add(
		'observe#2 with 4 and 2 with 2',
		labelCombinationFactory([4, 4, 2, 2], (client, { summary }, labels) =>
			summary.observe(labels, 1),
		),
		{ teardown, setup: setup(4) },
	);

	suite.add(
		'observe#2 with 2 and 2 with 4',
		labelCombinationFactory([2, 2, 4, 4], (client, { summary }, labels) =>
			summary.observe(labels, 1),
		),
		{ teardown, setup: setup(4) },
	);

	suite.add(
		'observe#6 with 2',
		labelCombinationFactory([2, 2, 2, 2, 2, 2], (client, { summary }, labels) =>
			summary.observe(labels, 1),
		),
		{ teardown, setup: setup(6) },
	);
}

function setup(labelCount) {
	return client => {
		const registry = new client.Registry();

		const summary = new client.Summary({
			name: 'summary',
			help: 'summary',
			labelNames: getLabelNames(labelCount),
			registers: [registry],
		});

		return { registry, summary };
	};
}

function teardown(client, { registry }) {
	registry.clear();
}

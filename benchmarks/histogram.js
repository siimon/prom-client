'use strict';

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

module.exports = setupHistogramSuite;

function setupHistogramSuite(suite) {
	suite.add(
		'observe#1 with 64',
		permutations([64], (client, { histogram }, labels) =>
			histogram.observe(1, labels)
		),
		{ teardown, setup: setup(1) }
	);

	suite.add(
		'observe#2 with 8',
		permutations([8, 8], (client, { histogram }, labels) =>
			histogram.observe(1, labels)
		),
		{ teardown, setup: setup(2) }
	);

	suite.add(
		'observe#2 with 4 and 2 with 2',
		permutations([4, 4, 2, 2], (client, { histogram }, labels) =>
			histogram.observe(1, labels)
		),
		{ teardown, setup: setup(4) }
	);

	suite.add(
		'observe#2 with 2 and 2 with 4',
		permutations([2, 2, 4, 4], (client, { histogram }, labels) =>
			histogram.observe(1, labels)
		),
		{ teardown, setup: setup(4) }
	);

	suite.add(
		'observe#6 with 2',
		permutations([2, 2, 2, 2, 2, 2], (client, { histogram }, labels) =>
			histogram.observe(1, labels)
		),
		{ teardown, setup: setup(6) }
	);
}

function setup(labelCount) {
	return client => {
		const registry = new client.Registry();

		const histogram = new client.Histogram({
			name: 'histogram',
			help: 'histogram',
			labelNames: getLabelNames(labelCount),
			registers: [registry]
		});

		return { registry, histogram };
	};
}

function teardown(client, { registry }) {
	registry.clear();
}

function getLabelNames(count) {
	return letters.slice(0, count);
}

const flatten = (a, b) => [].concat(...a.map(c => b.map(d => [].concat(c, d))));
const cartesianProduct = (a, b, ...c) =>
	b ? cartesianProduct(flatten(a, b), ...c) : a;
const times = a => Array.from(Array(a)).map((_, x) => x);

function permutations(labelValues, fn) {
	const labelNames = getLabelNames(labelValues.length);
	labelValues = labelValues.length > 1 ? labelValues : labelValues.concat(1);
	const labelValuesArray = labelValues.map(times);
	const labelValueCombinations = cartesianProduct(...labelValuesArray);
	const labelCombinations = labelValueCombinations.map(values =>
		labelNames.reduce((acc, label, i) => {
			acc[label] = values[i];
			return acc;
		}, {})
	);

	return (client, ctx) =>
		labelCombinations.forEach(labels => fn(client, ctx, labels));
}

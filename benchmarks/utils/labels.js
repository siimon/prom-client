'use strict';

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

module.exports = {
	getLabelNames,
	getLabelCombinations,
	labelCombinationFactory,
};

function getLabelNames(count) {
	return letters.slice(0, count);
}

const flatten = (a, b) => [].concat(...a.map(c => b.map(d => [].concat(c, d))));
const cartesianProduct = (a, b, ...c) =>
	b ? cartesianProduct(flatten(a, b), ...c) : a;
const times = a => Array.from(Array(a)).map((_, x) => x);

function getLabelCombinations(labelValues) {
	const labelNames = getLabelNames(labelValues.length);
	labelValues = labelValues.length > 1 ? labelValues : labelValues.concat(1);
	const labelValuesArray = labelValues.map(times);
	const labelValueCombinations = cartesianProduct(...labelValuesArray);
	return labelValueCombinations.map(values =>
		labelNames.reduce((acc, label, i) => {
			acc[label] = values[i];
			return acc;
		}, {}),
	);
}

function labelCombinationFactory(labelValues, fn) {
	const labelCombinations = getLabelCombinations(labelValues);

	return (client, ctx) =>
		labelCombinations.forEach(labels => fn(client, ctx, labels));
}

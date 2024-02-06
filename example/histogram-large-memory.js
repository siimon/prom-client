'use strict';

const v8 = require('v8');
const { register, Histogram } = require('..');

// Create more metrics

async function run() {
	const labelNames = Array(10).map((_, idx) => `label_${idx}`);

	const getRandomLabels = () =>
		labelNames.reduce((acc, label) => {
			return { ...acc, [label]: `value_${Math.random()}` };
		}, {});

	for (let i = 0; i < 100000; i++) {
		const h = new Histogram({
			name: `test_histogram_${i}`,
			help: `Example of a histogram ${i}`,
			buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
			labelNames,
		});
		h.observe(getRandomLabels(), Math.random());
	}

	await register.metrics();

	global.gc();

	v8.writeHeapSnapshot();
}

run();

'use strict';

const { register, Registry, Counter, Histogram } = require('..');

async function makeCounters() {
	const c = new Counter({
		name: 'test_counter_exemplar',
		help: 'Example of a counter with exemplar',
		labelNames: ['code'],
		enableExemplars: true,
	});

	const exemplarLabels = { traceId: '888', spanId: 'jjj' };

	c.inc({
		labels: { code: 300 },
		value: 1,
		exemplarLabels,
	});
	c.inc({
		labels: { code: 200 },
		exemplarLabels,
	});

	c.inc({ exemplarLabels });
	c.inc();
}

async function makeHistograms() {
	const h = new Histogram({
		name: 'test_histogram_exemplar',
		help: 'Example of a histogram with exemplar',
		labelNames: ['code'],
		enableExemplars: true,
	});

	const exemplarLabels = { traceId: '111', spanId: 'zzz' };

	h.observe({
		labels: { code: '200' },
		value: 1,
		exemplarLabels,
	});

	h.observe({
		labels: { code: '200' },
		value: 3,
		exemplarLabels,
	});

	h.observe({
		labels: { code: '200' },
		value: 0.3,
		exemplarLabels,
	});

	h.observe({
		labels: { code: '200' },
		value: 300,
		exemplarLabels,
	});
}

async function main() {
	// should only use exemplars with OpenMetrics registry types
	register.setContentType(Registry.OPENMETRICS_CONTENT_TYPE);

	makeCounters();
	makeHistograms();

	console.log(await register.metrics());
}

main();

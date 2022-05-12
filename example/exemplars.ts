import * as prom from '../index';

async function prometheusRegistry() {
	let reg = new prom.Registry();

	let counter = new prom.Counter({
		name: 'test_counter',
		help: 'counter help message',
		registers: [reg],
		labelNames: ['code'],
	});

	let hist = new prom.Histogram({
		name: 'test_histogram',
		help: 'histogram help message',
		registers: [reg],
		labelNames: ['code'],
	});

	counter.inc({ code: '300' }, 2);
	hist.observe({ code: '200' }, 1);

	console.log(await reg.metrics());
}

async function openMetricsRegistry() {
	let reg = new prom.Registry<prom.OpenMetricsContentType>();
	reg.setContentType(prom.openMetricsContentType);

	let counter = new prom.Counter({
		name: 'test_counter',
		help: 'counter help message',
		registers: [reg],
		labelNames: ['code'],
		enableExemplars: true,
	});

	let hist = new prom.Histogram({
		name: 'test_histogram',
		help: 'histogram help message',
		registers: [reg],
		labelNames: ['code'],
		enableExemplars: true,
	});

	counter.inc(<prom.IncreaseDataWithExemplar<string>>{
		value: 2,
		labels: { code: '300' },
		exemplarLabels: { traceID: 'traceA' },
	});

	hist.observe(<prom.ObserveDataWithExemplar<string>>{
		value: 1,
		labels: { code: '200' },
		exemplarLabels: { traceID: 'traceA' },
	});

	console.log(await reg.metrics());
}

async function main() {
	prometheusRegistry();
	openMetricsRegistry();
}

main();

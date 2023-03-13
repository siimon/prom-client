'use strict';

const Registry = require('../index').Registry;
const globalRegistry = require('../index').register;
const Histogram = require('../index').Histogram;
const Counter = require('../index').Counter;

Date.now = jest.fn(() => 1678654679000);

describe('Exemplars', () => {
	it('should throw when using with Prometheus registry', async () => {
		globalRegistry.setContentType(Registry.PROMETHEUS_CONTENT_TYPE);
		expect(() => {
			const counterInstance = new Counter({
				name: 'counter_exemplar_test',
				help: 'help',
				labelNames: ['method', 'code'],
				enableExemplars: true,
			});
		}).toThrowError('Exemplars are supported only on OpenMetrics registries');
	});
	describe.each([['OpenMetrics', Registry.OPENMETRICS_CONTENT_TYPE]])(
		'with %s registry',
		(tag, regType) => {
			beforeEach(() => {
				globalRegistry.setContentType(regType);
			});

			it('should make counter with exemplar', async () => {
				const counterInstance = new Counter({
					name: 'counter_exemplar_test',
					help: 'help',
					labelNames: ['method', 'code'],
					enableExemplars: true,
				});
				counterInstance.inc({
					value: 2,
					labels: { method: 'get', code: '200' },
					exemplarLabels: { traceId: 'trace_id_test', spanId: 'span_id_test' },
				});
				const vals = await counterInstance.get();
				expect(vals.values[0].value).toEqual(2);
				expect(vals.values[0].exemplar.value).toEqual(2);
				expect(vals.values[0].exemplar.labelSet.traceId).toEqual(
					'trace_id_test',
				);
			});

			it('should make histogram with exemplars on multiple buckets', async () => {
				const histogramInstance = new Histogram({
					name: 'histogram_exemplar_test',
					help: 'test',
					labelNames: ['method', 'code'],
					enableExemplars: true,
				});

				histogramInstance.observe({
					value: 0.007,
					labels: { method: 'get', code: '200' },
					exemplarLabels: {
						traceId: 'trace_id_test_1',
						spanId: 'span_id_test_1',
					},
				});
				histogramInstance.observe({
					value: 0.4,
					labels: { method: 'get', code: '200' },
					exemplarLabels: {
						traceId: 'trace_id_test_2',
						spanId: 'span_id_test_2',
					},
				});
				histogramInstance.observe({
					value: 11,
					labels: { method: 'get', code: '200' },
					exemplarLabels: {
						traceId: 'trace_id_test_3',
						spanId: 'span_id_test_3',
					},
				});

				const vals = (await histogramInstance.get()).values;

				expect(getValuesByLabel(0.005, vals)[0].value).toEqual(0);
				expect(getValuesByLabel(0.005, vals)[0].exemplar).toEqual(null);

				expect(getValuesByLabel(0.5, vals)[0].value).toEqual(2);
				expect(
					getValuesByLabel(0.5, vals)[0].exemplar.labelSet.traceId,
				).toEqual('trace_id_test_2');
				expect(getValuesByLabel(0.5, vals)[0].exemplar.value).toEqual(0.4);

				expect(getValuesByLabel(10, vals)[0].value).toEqual(2);
				expect(getValuesByLabel(10, vals)[0].exemplar).toEqual(null);

				expect(getValuesByLabel('+Inf', vals)[0].value).toEqual(3);
				expect(
					getValuesByLabel('+Inf', vals)[0].exemplar.labelSet.traceId,
				).toEqual('trace_id_test_3');
				expect(getValuesByLabel('+Inf', vals)[0].exemplar.value).toEqual(11);

				expect(await globalRegistry.metrics()).toMatchSnapshot();
			});

			it('should throw if exemplar is too long', async () => {
				const histogramInstance = new Histogram({
					name: 'histogram_too_long_exemplar_test',
					help: 'test',
					labelNames: ['method', 'code'],
					enableExemplars: true,
				});

				expect(() => {
					histogramInstance.observe({
						value: 0.007,
						labels: { method: 'get', code: '200' },
						exemplarLabels: {
							traceId: 'j'.repeat(100),
							spanId: 'j'.repeat(100),
						},
					});
				}).toThrowError('Label set size must be smaller than 128 UTF-8 chars');
			});

			function getValuesByLabel(label, values, key) {
				return values.reduce((acc, val) => {
					if (val.labels && val.labels[key || 'le'] === label) {
						acc.push(val);
					}
					return acc;
				}, []);
			}
		},
	);
});

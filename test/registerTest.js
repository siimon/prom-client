'use strict';

describe('register', () => {
	const register = require('../index').register;
	const Counter = require('../index').Counter;
	const Gauge = require('../index').Gauge;
	const Histogram = require('../index').Histogram;
	const Registry = require('../index').Registry;
	const Summary = require('../index').Summary;

	beforeEach(() => {
		register.clear();
	});

	describe('should output a counter metric', () => {
		let output;
		beforeEach(() => {
			register.registerMetric(getMetric());
			output = register.metrics().split('\n');
		});

		it('with help as first item', () => {
			expect(output[0]).toEqual('# HELP test_metric A test metric');
		});
		it('with type as second item', () => {
			expect(output[1]).toEqual('# TYPE test_metric counter');
		});
		it('with first value of the metric as third item', () => {
			expect(output[2]).toEqual('test_metric{label="hello",code="303"} 12');
		});
		it('with second value of the metric as fourth item', () => {
			expect(output[3]).toEqual('test_metric{label="bye",code="404"} 34');
		});
	});

	it('should throw on more than one metric', () => {
		register.registerMetric(getMetric());

		expect(() => {
			register.registerMetric(getMetric());
		}).toThrowError(
			'A metric with the name test_metric has already been registered.',
		);
	});

	it('should handle and output a metric with a NaN value', () => {
		const gauge = new Gauge({
			name: 'test_metric',
			help: 'A test metric',
		});
		gauge.set(NaN);
		register.registerMetric(gauge);

		const lines = register.metrics().split('\n');
		expect(lines).toHaveLength(4);
		expect(lines[2]).toEqual('test_metric Nan');
	});

	it('should handle and output a metric with an +Infinity value', () => {
		const gauge = new Gauge({
			name: 'test_metric',
			help: 'A test metric',
		});
		gauge.set(Infinity);
		register.registerMetric(gauge);
		const lines = register.metrics().split('\n');
		expect(lines).toHaveLength(4);
		expect(lines[2]).toEqual('test_metric +Inf');
	});

	it('should handle and output a metric with an -Infinity value', () => {
		const gauge = new Gauge({
			name: 'test_metric',
			help: 'A test metric',
		});
		gauge.set(-Infinity);
		register.registerMetric(gauge);
		const lines = register.metrics().split('\n');
		expect(lines).toHaveLength(4);
		expect(lines[2]).toEqual('test_metric -Inf');
	});

	it('should handle a metric without labels', () => {
		const counter = new Counter({
			name: 'test_metric',
			help: 'A test metric',
		});
		counter.inc(1);
		register.registerMetric(counter);
		expect(register.metrics().split('\n')).toHaveLength(4);
	});

	it('should handle a metric with default labels', () => {
		register.setDefaultLabels({ testLabel: 'testValue' });
		const counter = new Counter({
			name: 'test_metric',
			help: 'A test metric',
		});
		counter.inc(1);
		register.registerMetric(counter);

		const output = register.metrics().split('\n')[2];
		expect(output).toEqual('test_metric{testLabel="testValue"} 1');
	});

	it('labeled metrics should take precidence over defaulted', () => {
		register.setDefaultLabels({ testLabel: 'testValue' });
		const counter = new Counter({
			name: 'test_metric',
			help: 'A test metric',
			labelNames: ['testLabel', 'anotherLabel'],
		});
		counter.inc({ testLabel: 'overlapped', anotherLabel: 'value123' }, 1);
		register.registerMetric(counter);

		expect(register.metrics().split('\n')[2]).toEqual(
			'test_metric{testLabel="overlapped",anotherLabel="value123"} 1',
		);
	});

	it('should output all initialized metrics at value 0', () => {
		new Counter({ name: 'counter', help: 'help' });
		new Gauge({ name: 'gauge', help: 'help' });
		new Histogram({ name: 'histogram', help: 'help' });
		new Summary({ name: 'summary', help: 'help' });

		expect(register.metrics()).toMatchSnapshot();
	});

	it('should not output all initialized metrics at value 0 if labels', () => {
		new Counter({ name: 'counter', help: 'help', labelNames: ['label'] });
		new Gauge({ name: 'gauge', help: 'help', labelNames: ['label'] });
		new Histogram({ name: 'histogram', help: 'help', labelNames: ['label'] });
		new Summary({ name: 'summary', help: 'help', labelNames: ['label'] });

		expect(register.metrics()).toMatchSnapshot();
	});

	it('should escape " in label values', () => {
		const counter = new Counter({
			name: 'test_metric',
			help: 'A test metric',
			labelNames: ['label', 'code'],
		});
		counter.inc({ label: 'hello', code: '3"03' }, 12);
		register.registerMetric(counter);
		const escapedResult = register.metrics();
		expect(escapedResult).toMatch(
			'test_metric{label="hello",code="3\\"03"} 12',
		);
	});

	it('should escape " in default label values', () => {
		const counter = new Counter({
			name: 'test_metric',
			help: 'A test metric',
			labelNames: ['label', 'code'],
		});
		counter.inc({ label: 'hello', code: '3"03' }, 12);
		register.setDefaultLabels({
			defaultRegistryLabel: 'test"Value',
		});
		register.registerMetric(counter);
		const escapedResult = register.metrics();
		expect(escapedResult).toMatch(
			'test_metric{label="hello",code="3\\"03",defaultRegistryLabel="test\\"Value"} 12',
		);
	});

	describe('should output metrics as JSON', () => {
		it('should output metrics as JSON', () => {
			register.registerMetric(getMetric());
			const output = register.getMetricsAsJSON();

			expect(output.length).toEqual(1);
			expect(output[0].name).toEqual('test_metric');
			expect(output[0].type).toEqual('counter');
			expect(output[0].help).toEqual('A test metric');
			expect(output[0].values.length).toEqual(2);
		});

		it('should add default labels to JSON', () => {
			register.registerMetric(getMetric());
			register.setDefaultLabels({
				defaultRegistryLabel: 'testValue',
			});
			const output = register.getMetricsAsJSON();

			expect(output.length).toEqual(1);
			expect(output[0].name).toEqual('test_metric');
			expect(output[0].type).toEqual('counter');
			expect(output[0].help).toEqual('A test metric');
			expect(output[0].values.length).toEqual(2);
			expect(output[0].values[0].labels).toEqual({
				code: '303',
				label: 'hello',
				defaultRegistryLabel: 'testValue',
			});
		});
	});

	it('should allow removing single metrics', () => {
		register.registerMetric(getMetric());
		register.registerMetric(getMetric({ name: 'some_other_name' }));

		let output = register.getMetricsAsJSON();
		expect(output.length).toEqual(2);

		register.removeSingleMetric('test_metric');

		output = register.getMetricsAsJSON();

		expect(output.length).toEqual(1);
		expect(output[0].name).toEqual('some_other_name');
	});

	it('should allow getting single metrics', () => {
		const metric = getMetric();
		register.registerMetric(metric);

		const output = register.getSingleMetric('test_metric');
		expect(output).toEqual(metric);
	});

	it('should allow gettings metrics', () => {
		const metric = getMetric();
		register.registerMetric(metric);
		const metrics = register.metrics();

		expect(metrics.split('\n')[3]).toEqual(
			'test_metric{label="bye",code="404"} 34',
		);
	});

	describe('resetting', () => {
		it('should allow resetting all metrics', () => {
			const counter = new Counter({
				name: 'test_counter',
				help: 'test metric',
				labelNames: ['serial', 'active'],
			});
			const gauge = new Gauge({
				name: 'test_gauge',
				help: 'Another test metric',
				labelNames: ['level'],
			});
			const histo = new Histogram({
				name: 'test_histo',
				help: 'test',
			});
			const summ = new Summary({
				name: 'test_summ',
				help: 'test',
				percentiles: [0.5],
			});
			register.registerMetric(counter);
			register.registerMetric(gauge);
			register.registerMetric(histo);
			register.registerMetric(summ);

			counter.inc({ serial: '12345', active: 'yes' }, 12);
			gauge.set({ level: 'low' }, -12);
			histo.observe(1);
			summ.observe(100);

			register.resetMetrics();

			const same_counter = register.getSingleMetric('test_counter');
			expect(same_counter.get().values).toEqual([]);

			const same_gauge = register.getSingleMetric('test_gauge');
			expect(same_gauge.get().values).toEqual([]);

			const same_histo = register.getSingleMetric('test_histo');
			expect(histo.get().values).toEqual([]);

			const same_summ = register.getSingleMetric('test_summ');
			expect(same_summ.get().values[0].value).toEqual(0);
		});
	});

	describe('Registry with default labels', () => {
		const Registry = require('../lib/registry');

		describe('mutation tests', () => {
			describe('registry.metrics()', () => {
				it('should not throw with default labels (counter)', () => {
					const r = new Registry();
					r.setDefaultLabels({
						env: 'development',
					});

					const counter = new Counter({
						name: 'my_counter',
						help: 'my counter',
						registers: [r],
						labelNames: ['type'],
					});

					const myCounter = counter.labels('myType');

					myCounter.inc();

					const metrics = r.metrics();
					const lines = metrics.split('\n');
					expect(lines).toContain(
						'my_counter{type="myType",env="development"} 1',
					);

					myCounter.inc();

					const metrics2 = r.metrics();
					const lines2 = metrics2.split('\n');
					expect(lines2).toContain(
						'my_counter{type="myType",env="development"} 2',
					);
				});

				it('should not throw with default labels (gauge)', () => {
					const r = new Registry();
					r.setDefaultLabels({
						env: 'development',
					});

					const gauge = new Gauge({
						name: 'my_gauge',
						help: 'my gauge',
						registers: [r],
						labelNames: ['type'],
					});

					const myGauge = gauge.labels('myType');

					myGauge.inc(1);

					const metrics = r.metrics();
					const lines = metrics.split('\n');
					expect(lines).toContain(
						'my_gauge{type="myType",env="development"} 1',
					);

					myGauge.inc(2);

					const metrics2 = r.metrics();
					const lines2 = metrics2.split('\n');
					expect(lines2).toContain(
						'my_gauge{type="myType",env="development"} 3',
					);
				});

				it('should not throw with default labels (histogram)', () => {
					const r = new Registry();
					r.setDefaultLabels({
						env: 'development',
					});

					const hist = new Histogram({
						name: 'my_histogram',
						help: 'my histogram',
						registers: [r],
						labelNames: ['type'],
					});

					const myHist = hist.labels('myType');

					myHist.observe(1);

					const metrics = r.metrics();
					const lines = metrics.split('\n');
					expect(lines).toContain(
						'my_histogram_bucket{type="myType",env="development",le="1"} 1',
					);

					myHist.observe(1);

					const metrics2 = r.metrics();
					const lines2 = metrics2.split('\n');
					expect(lines2).toContain(
						'my_histogram_bucket{type="myType",env="development",le="1"} 2',
					);
				});
			});

			describe('registry.getMetricsAsJSON()', () => {
				it('should not throw with default labels (counter)', () => {
					const r = new Registry();
					r.setDefaultLabels({
						env: 'development',
					});

					const counter = new Counter({
						name: 'my_counter',
						help: 'my counter',
						registers: [r],
						labelNames: ['type'],
					});

					const myCounter = counter.labels('myType');

					myCounter.inc();

					const metrics = r.getMetricsAsJSON();
					expect(metrics).toContainEqual({
						aggregator: 'sum',
						help: 'my counter',
						name: 'my_counter',
						type: 'counter',
						values: [
							{
								labels: { env: 'development', type: 'myType' },
								value: 1,
							},
						],
					});

					myCounter.inc();

					const metrics2 = r.getMetricsAsJSON();
					expect(metrics2).toContainEqual({
						aggregator: 'sum',
						help: 'my counter',
						name: 'my_counter',
						type: 'counter',
						values: [
							{
								labels: { env: 'development', type: 'myType' },
								value: 2,
							},
						],
					});
				});

				it('should not throw with default labels (gauge)', () => {
					const r = new Registry();
					r.setDefaultLabels({
						env: 'development',
					});

					const gauge = new Gauge({
						name: 'my_gauge',
						help: 'my gauge',
						registers: [r],
						labelNames: ['type'],
					});

					const myGauge = gauge.labels('myType');

					myGauge.inc(1);

					const metrics = r.getMetricsAsJSON();
					expect(metrics).toContainEqual({
						aggregator: 'sum',
						help: 'my gauge',
						name: 'my_gauge',
						type: 'gauge',
						values: [
							{
								labels: { env: 'development', type: 'myType' },
								value: 1,
							},
						],
					});

					myGauge.inc(2);

					const metrics2 = r.getMetricsAsJSON();
					expect(metrics2).toContainEqual({
						aggregator: 'sum',
						help: 'my gauge',
						name: 'my_gauge',
						type: 'gauge',
						values: [
							{
								labels: { env: 'development', type: 'myType' },
								value: 3,
							},
						],
					});
				});

				it('should not throw with default labels (histogram)', () => {
					const r = new Registry();
					r.setDefaultLabels({
						env: 'development',
					});

					const hist = new Histogram({
						name: 'my_histogram',
						help: 'my histogram',
						registers: [r],
						labelNames: ['type'],
					});

					const myHist = hist.labels('myType');

					myHist.observe(1);

					const metrics = r.getMetricsAsJSON();
					// NOTE: at this test we don't need to check exacte JSON schema
					expect(metrics[0].values).toContainEqual({
						labels: { env: 'development', le: 1, type: 'myType' },
						metricName: 'my_histogram_bucket',
						value: 1,
					});

					myHist.observe(1);

					const metrics2 = r.getMetricsAsJSON();
					// NOTE: at this test we don't need to check exacte JSON schema
					expect(metrics2[0].values).toContainEqual({
						labels: { env: 'development', le: 1, type: 'myType' },
						metricName: 'my_histogram_bucket',
						value: 2,
					});
				});
			});
		});
	});

	describe('merging', () => {
		let registryOne;
		let registryTwo;

		beforeEach(() => {
			registryOne = new Registry();
			registryTwo = new Registry();
		});

		it('should merge all provided registers', () => {
			registryOne.registerMetric(
				getMetric({ name: 'one', registers: [registryOne] }),
			);
			registryTwo.registerMetric(
				getMetric({ name: 'two', registers: [registryTwo] }),
			);

			const merged = Registry.merge([
				registryOne,
				registryTwo,
			]).getMetricsAsJSON();
			expect(merged).toHaveLength(2);
		});

		it('should throw if same name exists on both registers', () => {
			registryOne.registerMetric(getMetric({ registers: [registryOne] }));
			registryTwo.registerMetric(getMetric({ registers: [registryTwo] }));

			const fn = function () {
				Registry.merge([registryOne, registryTwo]);
			};

			expect(fn).toThrowError(Error);
		});
	});

	function getMetric(configuration) {
		const counter = new Counter({
			name: 'test_metric',
			help: 'A test metric',
			labelNames: ['label', 'code'],
			...configuration,
		});
		counter.inc({ label: 'hello', code: '303' }, 12);
		counter.inc({ label: 'bye', code: '404' }, 34);

		return counter;
	}
});

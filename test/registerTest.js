'use strict';

describe('register', () => {
	const register = require('../index').register;
	const expect = require('chai').expect;

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
			expect(output[0]).to.equal('# HELP test_metric A test metric');
		});
		it('with type as second item', () => {
			expect(output[1]).to.equal('# TYPE test_metric counter');
		});
		it('with first value of the metric as third item', () => {
			expect(output[2]).to.equal('test_metric{label="hello",code="303"} 12');
		});
		it('with second value of the metric as fourth item', () => {
			expect(output[3]).to.equal(
				'test_metric{label="bye",code="404"} 34 1485392700000'
			);
		});
	});

	it('should throw on more than one metric', () => {
		register.registerMetric(getMetric());

		expect(() => {
			register.registerMetric(getMetric());
		}).to.throw(
			'A metric with the name test_metric has already been registered.'
		);
	});

	it('should handle a metric without labels', () => {
		register.registerMetric({
			get() {
				return {
					name: 'test_metric',
					type: 'counter',
					help: 'A test metric',
					values: [
						{
							value: 1
						}
					]
				};
			}
		});
		const actual = register.metrics().split('\n');
		expect(actual).to.have.length(4);
	});

	describe('should escape', () => {
		let escapedResult;
		beforeEach(() => {
			register.registerMetric({
				get() {
					return {
						name: 'test_"_\\_\n_metric',
						help: 'help_help',
						type: 'counter'
					};
				}
			});
			escapedResult = register.metrics();
		});
		it('backslash to \\\\', () => {
			expect(escapedResult).to.match(/\\\\/);
		});
		it('newline to \\\\n', () => {
			expect(escapedResult).to.match(/\n/);
		});
	});

	it('should escape " in label values', () => {
		register.registerMetric({
			get() {
				return {
					name: 'test_metric',
					type: 'counter',
					help: 'A test metric',
					values: [
						{
							value: 12,
							labels: {
								label: 'hello',
								code: '3"03'
							}
						}
					]
				};
			}
		});
		const escapedResult = register.metrics();
		expect(escapedResult).to.match(/\\"/);
	});

	describe('should output metrics as JSON', () => {
		it('should output metrics as JSON', () => {
			register.registerMetric(getMetric());
			const output = register.getMetricsAsJSON();

			expect(output.length).to.equal(1);
			expect(output[0].name).to.equal('test_metric');
			expect(output[0].type).to.equal('counter');
			expect(output[0].help).to.equal('A test metric');
			expect(output[0].values.length).to.equal(2);
		});
	});

	it('should allow removing single metrics', () => {
		register.registerMetric(getMetric());
		register.registerMetric(getMetric('some other name'));

		let output = register.getMetricsAsJSON();
		expect(output.length).to.equal(2);

		register.removeSingleMetric('test_metric');

		output = register.getMetricsAsJSON();

		expect(output.length).to.equal(1);
		expect(output[0].name).to.equal('some other name');
	});

	it('should allow getting single metrics', () => {
		const metric = getMetric();
		register.registerMetric(metric);

		const output = register.getSingleMetric('test_metric');
		expect(output).to.equal(metric);
	});

	describe('merging', () => {
		const Registry = require('../lib/registry');
		let registryOne;
		let registryTwo;

		beforeEach(() => {
			registryOne = new Registry();
			registryTwo = new Registry();
		});

		it('should merge all provided registers', () => {
			registryOne.registerMetric(getMetric('one'));
			registryTwo.registerMetric(getMetric('two'));

			const merged = Registry.merge([
				registryOne,
				registryTwo
			]).getMetricsAsJSON();
			expect(merged).to.have.length(2);
		});

		it('should throw if same name exists on both registers', () => {
			registryOne.registerMetric(getMetric());
			registryTwo.registerMetric(getMetric());

			const fn = function() {
				Registry.merge([registryOne, registryTwo]);
			};

			expect(fn).to.throw(Error);
		});
	});

	function getMetric(name) {
		name = name || 'test_metric';
		return {
			name,
			get() {
				return {
					name,
					type: 'counter',
					help: 'A test metric',
					values: [
						{
							value: 12,
							labels: {
								label: 'hello',
								code: '303'
							}
						},
						{
							value: 34,
							timestamp: 1485392700000,
							labels: {
								label: 'bye',
								code: '404'
							}
						}
					]
				};
			}
		};
	}
});

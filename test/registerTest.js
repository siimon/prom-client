'use strict';

describe('register', function() {
	var register = require('../index').register;

	beforeEach(function() {
		register.clear();
	});

	describe('should output a counter metric', function() {
		var output;
		beforeEach(function() {
			register.registerMetric(getMetric());
			output = register.metrics().split('\n');
		});

		it('with help as first item', function() {
			expect(output[0]).toEqual('# HELP test_metric A test metric');
		});
		it('with type as second item', function() {
			expect(output[1]).toEqual('# TYPE test_metric counter');
		});
		it('with first value of the metric as third item', function() {
			expect(output[2]).toEqual('test_metric{label="hello",code="303"} 12');
		});
		it('with second value of the metric as fourth item', function() {
			expect(output[3]).toEqual(
				'test_metric{label="bye",code="404"} 34 1485392700000'
			);
		});
	});

	it('should throw on more than one metric', function() {
		register.registerMetric(getMetric());

		expect(function() {
			register.registerMetric(getMetric());
		}).toThrowError(
			'A metric with the name test_metric has already been registered.'
		);
	});

	it('should handle a metric without labels', function() {
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
		var actual = register.metrics().split('\n');
		expect(actual).toHaveLength(4);
	});

	describe('should escape', function() {
		var escapedResult;
		beforeEach(function() {
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
		it('backslash to \\\\', function() {
			expect(escapedResult).toMatch(/\\\\/);
		});
		it('newline to \\\\n', function() {
			expect(escapedResult).toMatch(/\n/);
		});
	});

	it('should escape " in label values', function() {
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
		var escapedResult = register.metrics();
		expect(escapedResult).toMatch(/\\"/);
	});

	describe('should output metrics as JSON', function() {
		it('should output metrics as JSON', function() {
			register.registerMetric(getMetric());
			var output = register.getMetricsAsJSON();

			expect(output.length).toEqual(1);
			expect(output[0].name).toEqual('test_metric');
			expect(output[0].type).toEqual('counter');
			expect(output[0].help).toEqual('A test metric');
			expect(output[0].values.length).toEqual(2);
		});
	});

	it('should allow removing single metrics', function() {
		register.registerMetric(getMetric());
		register.registerMetric(getMetric('some other name'));

		var output = register.getMetricsAsJSON();
		expect(output.length).toEqual(2);

		register.removeSingleMetric('test_metric');

		output = register.getMetricsAsJSON();

		expect(output.length).toEqual(1);
		expect(output[0].name).toEqual('some other name');
	});

	it('should allow getting single metrics', function() {
		var metric = getMetric();
		register.registerMetric(metric);

		var output = register.getSingleMetric('test_metric');
		expect(output).toEqual(metric);
	});

	describe('merging', function() {
		var Registry = require('../lib/registry');
		var registryOne;
		var registryTwo;

		beforeEach(function() {
			registryOne = new Registry();
			registryTwo = new Registry();
		});

		it('should merge all provided registers', function() {
			registryOne.registerMetric(getMetric('one'));
			registryTwo.registerMetric(getMetric('two'));

			var merged = Registry.merge([
				registryOne,
				registryTwo
			]).getMetricsAsJSON();
			expect(merged).toHaveLength(2);
		});

		it('should throw if same name exists on both registers', function() {
			registryOne.registerMetric(getMetric());
			registryTwo.registerMetric(getMetric());

			var fn = function() {
				Registry.merge([registryOne, registryTwo]);
			};

			expect(fn).toThrowError(Error);
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

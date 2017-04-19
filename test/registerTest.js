'use strict';

describe('register', function() {
	var register = require('../index').register;
	var expect = require('chai').expect;

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
			expect(output[0]).to.equal('# HELP test_metric A test metric');
		});
		it('with type as second item', function() {
			expect(output[1]).to.equal('# TYPE test_metric counter');
		});
		it('with value of the metric as third item', function() {
			expect(output[2]).to.equal('test_metric{label="hello",code="303"} 12');
		});
	});

	it('should throw on more than one metric', function() {
		register.registerMetric(getMetric());

		expect(function() {
			register.registerMetric(getMetric());
		}).to.throw('A metric with the name test_metric has already been registered.');
	});

	it('should handle a metric without labels', function() {
		register.registerMetric({
			get: function() {
				return {
					name: 'test_metric',
					type: 'counter',
					help: 'A test metric',
					values: [ {
						value: 1
					}]
				};
			}
		});
		var actual = register.metrics().split('\n');
		expect(actual).to.have.length(4);
	});

	describe('should escape', function() {
		var escapedResult;
		beforeEach(function() {
			register.registerMetric({
				get: function() {
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
			expect(escapedResult).to.match(/\\\\/);
		});
		it('newline to \\\\n', function() {
			expect(escapedResult).to.match(/\n/);
		});
	});

	it('should escape " in label values', function() {
		register.registerMetric({
			get: function() {
				return {
					name: 'test_metric',
					type: 'counter',
					help: 'A test metric',
					values: [ {
						value: 12,
						labels: {
							label: 'hello',
							code: '3"03'
						}
					}]
				};
			}
		});
		var escapedResult = register.metrics();
		expect(escapedResult).to.match(/\\"/);
	});

	describe('should output metrics as JSON', function() {
		it('should output metrics as JSON', function() {
			register.registerMetric(getMetric());
			var output = register.getMetricsAsJSON();

			expect(output.length).to.equal(1);
			expect(output[0].name).to.equal('test_metric');
			expect(output[0].type).to.equal('counter');
			expect(output[0].help).to.equal('A test metric');
			expect(output[0].values.length).to.equal(1);
		});
	});

	it('should allow removing single metrics', function() {
		register.registerMetric(getMetric());
		register.registerMetric(getMetric('some other name'));

		var output = register.getMetricsAsJSON();
		expect(output.length).to.equal(2);

		register.removeSingleMetric('test_metric');

		output = register.getMetricsAsJSON();

		expect(output.length).to.equal(1);
		expect(output[0].name).to.equal('some other name');
	});

	it('should allow getting single metrics', function() {
		var metric = getMetric();
		register.registerMetric(metric);

		var output = register.getSingleMetric('test_metric');
		expect(output).to.equal(metric);
	});

	function getMetric(name) {
		name = name || 'test_metric';
		return {
			name: name,
			get: function() {
				return {
					name: name,
					type: 'counter',
					help: 'A test metric',
					values: [ {
						value: 12,
						labels: {
							label: 'hello',
							code: '303'
						}
					}]
				};
			}
		};
	}
});

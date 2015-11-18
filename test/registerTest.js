'use strict';

describe('register', function() {
	var register = require('../lib/register');
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

	it('should handle more than one metric', function() {
		register.registerMetric(getMetric());
		register.registerMetric(getMetric());

		var actual = register.metrics().split('\n');
		expect(actual).to.have.length(6);
	});

	it('should handle a metric without labels', function() {
		register.registerMetric({
			name: 'test_metric',
			type: 'counter',
			help: 'A test metric',
			values: [ {
				value: 1
			}]
		});
		var actual = register.metrics().split('\n');
		expect(actual).to.have.length(3);
	});

	function getMetric() {
		return {
			name: 'test_metric',
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
});

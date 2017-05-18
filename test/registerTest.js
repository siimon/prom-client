'use strict';

var protobuf = require('protobufjs');
var MetricFamily;
protobuf.load('metrics.proto', function(err, root) {
	if(err !== null) {
		throw err;
	}
	MetricFamily = root.lookupType('io.prometheus.client.MetricFamily');
});


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
		it('with first value of the metric as third item', function() {
			expect(output[2]).to.equal('test_metric{label="hello",code="303"} 12');
		});
		it('with second value of the metric as fourth item', function() {
			expect(output[3]).to.equal('test_metric{label="bye",code="404"} 34 1485392700000');
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
			expect(output[0].values.length).to.equal(2);
		});
	});

	describe('should output metrics as Protobuf', function() {
		// If length delimiting is incorrect, it could work for one metric and
		// 	 not multiple, or vise versa - Test both
		var metric;
		beforeEach(function() {
			metric = getMetricProto();
			register.registerMetric(metric);
		});
		it('32-bit varint encoding and length delimiting a single metric', function() {
			var output = register.metricsProtobuf();

			var decoded = MetricFamily.toObject(MetricFamily.decodeDelimited(output), { longs: Number });
			expect(decoded).to.deep.equal(metric.getProtoCompliant());
		});
		it('32-bit varint encoding and length delimiting multiple metrics', function() {
			var otherMetric = getMetricProto('other_metric');
			register.registerMetric(otherMetric);
			var output = register.metricsProtobuf();

			var decoded = MetricFamily.toObject(MetricFamily.decodeDelimited(output), { longs: Number });
			expect(decoded).to.deep.equal(metric.getProtoCompliant());
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
					}, {
						value: 34,
						timestamp: 1485392700000,
						labels: {
							label: 'bye',
							code: '404'
						}
					}]
				};
			}
		};
	}

	function getMetricProto(name) {
		name = name || 'test_metric';
		return {
			name: name,
			getProtoCompliant: function() {
				return {
					name: name,
					help: 'test',
					type: 0,
					metric: [{
						label: [
							{
								name: 'method',
								value: 'GET'
							},
							{
								name: 'endpoint',
								value: '/test'
							}
						],
						counter: { value: 1234 },
						timestampMs: 1485392700000
					}]
				};
			}
		};
	}
});

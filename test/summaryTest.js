'use strict';

describe('summary', function() {
	var Summary = require('../index').summary;
	var expect = require('chai').expect;
	var sinon = require('sinon');
	var instance;

	beforeEach(function() {
		instance = new Summary('summary_test', 'test');
	});

	it('should add a value to the summary', function() {
		instance.observe(100);
		expect(instance.get().values[0].labels.quantile).to.equal(0.01);
		expect(instance.get().values[0].value).to.equal(100);
		expect(instance.get().values[7].metricName).to.equal('summary_test_sum');
		expect(instance.get().values[7].value).to.equal(100);
		expect(instance.get().values[8].metricName).to.equal('summary_test_count');
		expect(instance.get().values[8].value).to.equal(1);
	});

	it('should be able to observe 0s', function() {
		instance.observe(0);
		expect(instance.get().values[8].value).to.equal(1);
	});

	it('should correctly calculate percentiles when more values are added to the summary', function() {
		instance.observe(100);
		instance.observe(100);
		instance.observe(100);
		instance.observe(50);
		instance.observe(50);

		expect(instance.get().values.length).to.equal(9);

		expect(instance.get().values[0].labels.quantile).to.equal(0.01);
		expect(instance.get().values[0].value).to.equal(50);

		expect(instance.get().values[1].labels.quantile).to.equal(0.05);
		expect(instance.get().values[1].value).to.equal(50);

		expect(instance.get().values[2].labels.quantile).to.equal(0.5);
		expect(instance.get().values[2].value).to.equal(80);

		expect(instance.get().values[3].labels.quantile).to.equal(0.9);
		expect(instance.get().values[3].value).to.equal(100);

		expect(instance.get().values[4].labels.quantile).to.equal(0.95);
		expect(instance.get().values[4].value).to.equal(100);

		expect(instance.get().values[5].labels.quantile).to.equal(0.99);
		expect(instance.get().values[5].value).to.equal(100);

		expect(instance.get().values[6].labels.quantile).to.equal(0.999);
		expect(instance.get().values[6].value).to.equal(100);

		expect(instance.get().values[7].metricName).to.equal('summary_test_sum');
		expect(instance.get().values[7].value).to.equal(400);

		expect(instance.get().values[8].metricName).to.equal('summary_test_count');
		expect(instance.get().values[8].value).to.equal(5);
	});

	it('should correctly use calculate other percentiles when configured', function() {
		instance = new Summary('summary_test', 'test', { percentiles: [ 0.5, 0.9 ] });
		instance.observe(100);
		instance.observe(100);
		instance.observe(100);
		instance.observe(50);
		instance.observe(50);

		expect(instance.get().values.length).to.equal(4);

		expect(instance.get().values[0].labels.quantile).to.equal(0.5);
		expect(instance.get().values[0].value).to.equal(80);

		expect(instance.get().values[1].labels.quantile).to.equal(0.9);
		expect(instance.get().values[1].value).to.equal(100);

		expect(instance.get().values[2].metricName).to.equal('summary_test_sum');
		expect(instance.get().values[2].value).to.equal(400);

		expect(instance.get().values[3].metricName).to.equal('summary_test_count');
		expect(instance.get().values[3].value).to.equal(5);
	});

	it('should allow to reset itself', function() {
		instance = new Summary('summary_test', 'test', { percentiles: [ 0.5 ] });
		instance.observe(100);
		expect(instance.get().values[0].labels.quantile).to.equal(0.5);
		expect(instance.get().values[0].value).to.equal(100);

		expect(instance.get().values[1].metricName).to.equal('summary_test_sum');
		expect(instance.get().values[1].value).to.equal(100);

		expect(instance.get().values[2].metricName).to.equal('summary_test_count');
		expect(instance.get().values[2].value).to.equal(1);

		instance.reset();

		expect(instance.get().values[0].labels.quantile).to.equal(0.5);
		expect(instance.get().values[0].value).to.equal(0);

		expect(instance.get().values[1].metricName).to.equal('summary_test_sum');
		expect(instance.get().values[1].value).to.equal(0);

		expect(instance.get().values[2].metricName).to.equal('summary_test_count');
		expect(instance.get().values[2].value).to.equal(0);
	});

	describe('labels', function() {
		beforeEach(function() {
			instance = new Summary('summary_test', 'help', [ 'method', 'endpoint'], { percentiles: [ 0.9 ] });
		});

		it('should record and calculate the correct values per label', function() {
			instance.labels('GET', '/test').observe(50);
			instance.labels('POST', '/test').observe(100);

			var values = instance.get().values;
			expect(values).to.have.length(6);
			expect(values[0].labels.method).to.equal('GET');
			expect(values[0].labels.endpoint).to.equal('/test');
			expect(values[0].labels.quantile).to.equal(0.9);
			expect(values[0].value).to.equal(50);

			expect(values[1].metricName).to.equal('summary_test_sum');
			expect(values[1].labels.method).to.equal('GET');
			expect(values[1].labels.endpoint).to.equal('/test');
			expect(values[1].value).to.equal(50);

			expect(values[2].metricName).to.equal('summary_test_count');
			expect(values[2].labels.method).to.equal('GET');
			expect(values[2].labels.endpoint).to.equal('/test');
			expect(values[2].value).to.equal(1);

			expect(values[3].labels.quantile).to.equal(0.9);
			expect(values[3].labels.method).to.equal('POST');
			expect(values[3].labels.endpoint).to.equal('/test');
			expect(values[3].value).to.equal(100);

			expect(values[4].metricName).to.equal('summary_test_sum');
			expect(values[4].labels.method).to.equal('POST');
			expect(values[4].labels.endpoint).to.equal('/test');
			expect(values[4].value).to.equal(100);

			expect(values[5].metricName).to.equal('summary_test_count');
			expect(values[5].labels.method).to.equal('POST');
			expect(values[5].labels.endpoint).to.equal('/test');
			expect(values[5].value).to.equal(1);
		});

		it('should throw error if label lengths does not match', function() {
			var fn = function() {
				instance.labels('GET').observe();
			};
			expect(fn).to.throw(Error);
		});

		it('should start a timer', function() {
			var clock = sinon.useFakeTimers();
			var end = instance.labels('GET', '/test').startTimer();
			clock.tick(1000);
			end();
			var values = instance.get().values;
			expect(values).to.have.length(3);
			expect(values[0].labels.method).to.equal('GET');
			expect(values[0].labels.endpoint).to.equal('/test');
			expect(values[0].labels.quantile).to.equal(0.9);
			expect(values[0].value).to.equal(1);

			expect(values[1].metricName).to.equal('summary_test_sum');
			expect(values[1].labels.method).to.equal('GET');
			expect(values[1].labels.endpoint).to.equal('/test');
			expect(values[1].value).to.equal(1);

			expect(values[2].metricName).to.equal('summary_test_count');
			expect(values[2].labels.method).to.equal('GET');
			expect(values[2].labels.endpoint).to.equal('/test');
			expect(values[2].value).to.equal(1);

			clock.restore();
		});

		it('should start a timer and set labels afterwards', function(){
			var clock = sinon.useFakeTimers();
			var end = instance.startTimer();
			clock.tick(1000);
			end({ 'method': 'GET', 'endpoint': '/test' });
			var values = instance.get().values;
			expect(values).to.have.length(3);
			expect(values[0].labels.method).to.equal('GET');
			expect(values[0].labels.endpoint).to.equal('/test');
			expect(values[0].labels.quantile).to.equal(0.9);
			expect(values[0].value).to.equal(1);

			expect(values[1].metricName).to.equal('summary_test_sum');
			expect(values[1].labels.method).to.equal('GET');
			expect(values[1].labels.endpoint).to.equal('/test');
			expect(values[1].value).to.equal(1);

			expect(values[2].metricName).to.equal('summary_test_count');
			expect(values[2].labels.method).to.equal('GET');
			expect(values[2].labels.endpoint).to.equal('/test');
			expect(values[2].value).to.equal(1);

			clock.restore();
		});

		it('should allow labels before and after timers', function(){
			var clock = sinon.useFakeTimers();
			var end = instance.startTimer({ 'method': 'GET' });
			clock.tick(1000);
			end({ 'endpoint': '/test' });
			var values = instance.get().values;
			expect(values).to.have.length(3);
			expect(values[0].labels.method).to.equal('GET');
			expect(values[0].labels.endpoint).to.equal('/test');
			expect(values[0].labels.quantile).to.equal(0.9);
			expect(values[0].value).to.equal(1);

			expect(values[1].metricName).to.equal('summary_test_sum');
			expect(values[1].labels.method).to.equal('GET');
			expect(values[1].labels.endpoint).to.equal('/test');
			expect(values[1].value).to.equal(1);

			expect(values[2].metricName).to.equal('summary_test_count');
			expect(values[2].labels.method).to.equal('GET');
			expect(values[2].labels.endpoint).to.equal('/test');
			expect(values[2].value).to.equal(1);

			clock.restore();
		});
	});
});

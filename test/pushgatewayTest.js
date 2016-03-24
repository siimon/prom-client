'use strict';

describe('pushgateway', function() {
	var Pushgateway = require('../index').Pushgateway;
	var nock = require('nock');
	var expect = require('chai').expect;
	var register = require('../index').register;
	var instance;

	beforeEach(function() {
		instance = new Pushgateway('http://192.168.99.100:9091');
		var Counter = new require('../index').Counter;
		var cnt = new Counter('test', 'test');
		cnt.inc(100);
	});
	afterEach(function() {
		register.clear();
	});

	describe('pushAdd', function() {
		it('should push metrics', function(done) {
			setupNock(202, 'post', '/metrics/job/testJob');

			instance.pushAdd({ jobName: 'testJob' }, function(err) {
				expect(err).to.not.exist;
				done();
			});
		});

		it('should use groupings', function(done) {
			setupNock(202, 'post', '/metrics/job/testJob/key/value');

			instance.pushAdd({ jobName: 'testJob', groupings: { key: 'value' } }, function(err) {
				expect(err).to.not.exist;
				done();
			});
		});

		it('should escape groupings', function(done) {
			setupNock(202, 'post', '/metrics/job/testJob/key/va%26lue');
			instance.pushAdd({ jobName: 'testJob', groupings: { key: 'va&lue' } }, function(err) {
				expect(err).to.not.exist;
				done();
			});
		});

	});

	describe('push', function() {
		it('should push with PUT', function(done) {
			setupNock(202, 'put', '/metrics/job/testJob');

			instance.push({ jobName: 'testJob' }, function(err) {
				expect(err).to.not.exist;
				done();
			});
		});

		it('should uri encode url', function(done) {
			setupNock(202, 'put', '/metrics/job/test%26Job');

			instance.push({ jobName: 'test&Job' }, function(err) {
				expect(err).to.not.exist;
				done();
			});
		});
	});

	describe('delete', function() {
		it('should push delete with no body', function(done) {
			setupNock(202, 'delete', '/metrics/job/testJob');

			instance.delete({ jobName: 'testJob' }, function(err) {
				expect(err).to.not.exist;
				done();
			});
		});
	});

	function setupNock(responseCode, method, path) {
		nock('http://192.168.99.100:9091', {'encodedQueryParams':true})
		[method](path)
		.reply(202, '', {
			'content-length': '0',
			'content-type': 'text/plain; charset=utf-8',
			connection: 'close' });
	}
});

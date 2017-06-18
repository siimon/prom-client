'use strict';

describe('pushgateway', function() {
	var Pushgateway = require('../index').Pushgateway;
	var nock = require('nock');
	var register = require('../index').register;
	var Registry = require('../index').Registry;
	var instance;
	var registry = undefined;

	var tests = function() {
		describe('pushAdd', function() {
			it('should push metrics', function(done) {
				setupNock(202, 'post', '/metrics/job/testJob');

				instance.pushAdd({ jobName: 'testJob' }, function(err) {
					expect(err).toBeFalsy();
					done();
				});
			});

			it('should use groupings', function(done) {
				setupNock(202, 'post', '/metrics/job/testJob/key/value');

				instance.pushAdd({ jobName: 'testJob', groupings: { key: 'value' } }, function(err) {
					expect(err).toBeFalsy();
					done();
				});
			});

			it('should escape groupings', function(done) {
				setupNock(202, 'post', '/metrics/job/testJob/key/va%26lue');
				instance.pushAdd({ jobName: 'testJob', groupings: { key: 'va&lue' } }, function(err) {
					expect(err).toBeFalsy();
					done();
				});
			});

		});

		describe('push', function() {
			it('should push with PUT', function(done) {
				setupNock(202, 'put', '/metrics/job/testJob');

				instance.push({ jobName: 'testJob' }, function(err) {
					expect(err).toBeFalsy();
					done();
				});
			});

			it('should uri encode url', function(done) {
				setupNock(202, 'put', '/metrics/job/test%26Job');

				instance.push({ jobName: 'test&Job' }, function(err) {
					expect(err).toBeFalsy();
					done();
				});
			});
		});

		describe('delete', function() {
			it('should push delete with no body', function(done) {
				setupNock(202, 'delete', '/metrics/job/testJob');

				instance.delete({ jobName: 'testJob' }, function(err) {
					expect(err).toBeFalsy();
					done();
				});
			});
		});

		describe('when using basic authentication', function() {
			var USERNAME = 'unittest';
			var PASSWORD = 'unittest';

			beforeEach(function() {
				instance = new Pushgateway('http://' + USERNAME + ':' + PASSWORD + '@192.168.99.100:9091', null, registry);
			});

			function verifyResult(done, err, response) {
				expect(err).toBeNull();
				expect(response.req.headers.authorization).toMatch(/^Basic/);

				done();
			}

			it('pushAdd should send POST request with basic auth data', function(done) {
				setupNock(202, 'post', '/metrics/job/testJob');

				instance.pushAdd({ jobName: 'testJob' }, verifyResult.bind({}, done));
			});

			it('push should send PUT request with basic auth data', function(done) {
				setupNock(202, 'put', '/metrics/job/testJob');

				instance.push({ jobName: 'testJob' }, verifyResult.bind({}, done));
			});

			it('delete should send DELETE request with basic auth data', function(done) {
				setupNock(202, 'delete', '/metrics/job/testJob');

				instance.delete({ jobName: 'testJob' }, verifyResult.bind({}, done));
			});
		});

		it('should be possible to extend http/s requests with options', function(done) {

			nock('http://192.168.99.100:9091', {'encodedQueryParams':true})
				.matchHeader('unit-test', '1')
				.put('/metrics/job/testJob')
				.reply(202, '', {
					'content-length': '0',
					'content-type': 'text/plain; charset=utf-8',
					connection: 'close' });

			instance = new Pushgateway('http://192.168.99.100:9091', {
				headers: {
					'unit-test': '1'
				}
			}, registry);

			instance.push({ jobName: 'testJob' }, function(err, res, body) {
				expect(err).toBeFalsy();
				expect(nock.isDone()).toEqual(true);
				done();
			});
		});
	};
	describe('global registry', function() {
		afterEach(function() {
			register.clear();
		});
		beforeEach(function() {
			registry = undefined;
			instance = new Pushgateway('http://192.168.99.100:9091');
			var promClient = require('../index');
			var cnt = new promClient.Counter('test', 'test');
			cnt.inc(100);
		});
		tests();
	});
	describe('registry instance', function() {
		beforeEach(function() {
			registry = new Registry();
			instance = new Pushgateway('http://192.168.99.100:9091', null, registry);
			var promeClient = require('../index');
			var cnt = new promeClient.Counter({name: 'test', help: 'test', registers: [ registry ]});
			cnt.inc(100);
		});
		tests();
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

'use strict';

var pushGatewayPath = '/path';
var pushGatewayURL = 'http://192.168.99.100:9091';
var pushGatewayFullURL = pushGatewayURL + pushGatewayPath;

describe('pushgateway with path', function() {
	var Pushgateway = require('../index').Pushgateway;
	var nock = require('nock');
	var expect = require('chai').expect;
	var register = require('../index').register;
	var Registry = require('../index').Registry;
	var instance;
	var registry = undefined;

	var tests = function() {
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

		describe('when using basic authentication', function() {
			var USERNAME = 'unittest';
			var PASSWORD = 'unittest';

			beforeEach(function() {
				instance = new Pushgateway('http://' + USERNAME + ':' + PASSWORD + '@192.168.99.100:9091' + pushGatewayPath, null, registry);
			});

			function verifyResult(done, err, response) {
				expect(err).not.to.exist;
				expect(response.req.headers.authorization).to.match(/^Basic/);

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

			nock(pushGatewayURL, {'encodedQueryParams':true})
				.matchHeader('unit-test', '1')
				.put(pushGatewayPath + '/metrics/job/testJob')
				.reply(202, '', {
					'content-length': '0',
					'content-type': 'text/plain; charset=utf-8',
					connection: 'close' });

			instance = new Pushgateway(pushGatewayFullURL, {
				headers: {
					'unit-test': '1'
				}
			}, registry);

			instance.push({ jobName: 'testJob' }, function(err, res, body) {
				expect(err).to.not.exist;
				expect(nock.isDone()).to.be.true;
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
			instance = new Pushgateway(pushGatewayFullURL);
			var Counter = new require('../index').Counter;
			var cnt = new Counter('test', 'test');
			cnt.inc(100);
		});
		tests();
	});
	describe('registry instance', function() {
		beforeEach(function() {
			registry = new Registry();
			instance = new Pushgateway(pushGatewayFullURL, null, registry);
			var Counter = new require('../index').Counter;
			var cnt = new Counter({name: 'test', help: 'test', registers: [ registry ]});
			cnt.inc(100);
		});
		tests();
	});

	function setupNock(responseCode, method, path) {
		nock(pushGatewayURL, {'encodedQueryParams':true})
			[method](pushGatewayPath + path)
			.reply(202, '', {
				'content-length': '0',
				'content-type': 'text/plain; charset=utf-8',
				connection: 'close' });
	}
});

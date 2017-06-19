'use strict';

const pushGatewayPath = '/path';
const pushGatewayURL = 'http://192.168.99.100:9091';
const pushGatewayFullURL = pushGatewayURL + pushGatewayPath;

describe('pushgateway with path', () => {
	const Pushgateway = require('../index').Pushgateway;
	const nock = require('nock');
	const register = require('../index').register;
	const Registry = require('../index').Registry;
	let instance;
	let registry = undefined;

	const tests = function() {
		describe('pushAdd', () => {
			it('should push metrics', done => {
				setupNock(202, 'post', '/metrics/job/testJob');

				instance.pushAdd({ jobName: 'testJob' }, err => {
					expect(err).toBeFalsy();
					done();
				});
			});

			it('should use groupings', done => {
				setupNock(202, 'post', '/metrics/job/testJob/key/value');

				instance.pushAdd(
					{ jobName: 'testJob', groupings: { key: 'value' } },
					err => {
						expect(err).toBeFalsy();
						done();
					}
				);
			});

			it('should escape groupings', done => {
				setupNock(202, 'post', '/metrics/job/testJob/key/va%26lue');
				instance.pushAdd(
					{ jobName: 'testJob', groupings: { key: 'va&lue' } },
					err => {
						expect(err).toBeFalsy();
						done();
					}
				);
			});
		});

		describe('push', () => {
			it('should push with PUT', done => {
				setupNock(202, 'put', '/metrics/job/testJob');

				instance.push({ jobName: 'testJob' }, err => {
					expect(err).toBeFalsy();
					done();
				});
			});

			it('should uri encode url', done => {
				setupNock(202, 'put', '/metrics/job/test%26Job');

				instance.push({ jobName: 'test&Job' }, err => {
					expect(err).toBeFalsy();
					done();
				});
			});
		});

		describe('delete', () => {
			it('should push delete with no body', done => {
				setupNock(202, 'delete', '/metrics/job/testJob');

				instance.delete({ jobName: 'testJob' }, err => {
					expect(err).toBeFalsy();
					done();
				});
			});
		});

		describe('when using basic authentication', () => {
			const USERNAME = 'unittest';
			const PASSWORD = 'unittest';

			beforeEach(() => {
				instance = new Pushgateway(
					'http://' +
						USERNAME +
						':' +
						PASSWORD +
						'@192.168.99.100:9091' +
						pushGatewayPath,
					null,
					registry
				);
			});

			function verifyResult(done, err, response) {
				expect(err).toBeNull();
				expect(response.req.headers.authorization).toMatch(/^Basic/);

				done();
			}

			it('pushAdd should send POST request with basic auth data', done => {
				setupNock(202, 'post', '/metrics/job/testJob');

				instance.pushAdd({ jobName: 'testJob' }, verifyResult.bind({}, done));
			});

			it('push should send PUT request with basic auth data', done => {
				setupNock(202, 'put', '/metrics/job/testJob');

				instance.push({ jobName: 'testJob' }, verifyResult.bind({}, done));
			});

			it('delete should send DELETE request with basic auth data', done => {
				setupNock(202, 'delete', '/metrics/job/testJob');

				instance.delete({ jobName: 'testJob' }, verifyResult.bind({}, done));
			});
		});

		it('should be possible to extend http/s requests with options', done => {
			nock(pushGatewayURL, { encodedQueryParams: true })
				.matchHeader('unit-test', '1')
				.put(pushGatewayPath + '/metrics/job/testJob')
				.reply(202, '', {
					'content-length': '0',
					'content-type': 'text/plain; charset=utf-8',
					connection: 'close'
				});

			instance = new Pushgateway(
				pushGatewayFullURL,
				{
					headers: {
						'unit-test': '1'
					}
				},
				registry
			);

			instance.push({ jobName: 'testJob' }, (err, res, body) => {
				expect(err).toBeFalsy();
				expect(nock.isDone()).toEqual(true);
				done();
			});
		});
	};
	describe('global registry', () => {
		afterEach(() => {
			register.clear();
		});
		beforeEach(() => {
			registry = undefined;
			instance = new Pushgateway(pushGatewayFullURL);
			const promClient = require('../index');
			const cnt = new promClient.Counter('test', 'test');
			cnt.inc(100);
		});
		tests();
	});
	describe('registry instance', () => {
		beforeEach(() => {
			registry = new Registry();
			instance = new Pushgateway(pushGatewayFullURL, null, registry);
			const promClient = require('../index');
			const cnt = new promClient.Counter({
				name: 'test',
				help: 'test',
				registers: [registry]
			});
			cnt.inc(100);
		});
		tests();
	});

	function setupNock(responseCode, method, path) {
		nock(pushGatewayURL, { encodedQueryParams: true })
			[method](pushGatewayPath + path)
			.reply(202, '', {
				'content-length': '0',
				'content-type': 'text/plain; charset=utf-8',
				connection: 'close'
			});
	}
});

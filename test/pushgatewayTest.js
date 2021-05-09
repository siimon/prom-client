'use strict';

const nock = require('nock');

describe('pushgateway', () => {
	const Pushgateway = require('../index').Pushgateway;
	const register = require('../index').register;
	const Registry = require('../index').Registry;
	let instance;
	let registry = undefined;

	const tests = function () {
		describe('pushAdd', () => {
			it('should push metrics', () => {
				const mockHttp = nock('http://192.168.99.100:9091')
					.post(
						'/metrics/job/testJob',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance.pushAdd({ jobName: 'testJob' }).then(() => {
					expect(mockHttp.isDone());
				});
			});

			it('should use groupings', () => {
				const mockHttp = nock('http://192.168.99.100:9091')
					.post(
						'/metrics/job/testJob/key/value',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance
					.pushAdd({
						jobName: 'testJob',
						groupings: { key: 'value' },
					})
					.then(() => {
						expect(mockHttp.isDone());
					});
			});

			it('should escape groupings', () => {
				const mockHttp = nock('http://192.168.99.100:9091')
					.post(
						'/metrics/job/testJob/key/va%26lue',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance
					.pushAdd({
						jobName: 'testJob',
						groupings: { key: 'va&lue' },
					})
					.then(() => {
						expect(mockHttp.isDone());
					});
			});
		});

		describe('push', () => {
			it('should push with PUT', () => {
				const mockHttp = nock('http://192.168.99.100:9091')
					.put(
						'/metrics/job/testJob',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance.push({ jobName: 'testJob' }).then(() => {
					expect(mockHttp.isDone());
				});
			});

			it('should uri encode url', () => {
				const mockHttp = nock('http://192.168.99.100:9091')
					.put(
						'/metrics/job/test%26Job',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance.push({ jobName: 'test&Job' }).then(() => {
					expect(mockHttp.isDone());
				});
			});
		});

		describe('delete', () => {
			it('should push delete with no body', () => {
				const mockHttp = nock('http://192.168.99.100:9091')
					.delete('/metrics/job/testJob')
					.reply(200);

				return instance.delete({ jobName: 'testJob' }).then(() => {
					expect(mockHttp.isDone());
				});
			});
		});

		describe('when using basic authentication', () => {
			const USERNAME = 'unittest';
			const PASSWORD = 'unittest';
			const auth = `${USERNAME}:${PASSWORD}`;

			beforeEach(() => {
				instance = new Pushgateway(
					`http://${auth}@192.168.99.100:9091`,
					null,
					registry,
				);
			});

			it('pushAdd should send POST request with basic auth data', () => {
				const mockHttp = nock(`http://${auth}@192.168.99.100:9091`)
					.post(
						'/metrics/job/testJob',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance.pushAdd({ jobName: 'testJob' }).then(() => {
					expect(mockHttp.isDone());
				});
			});

			it('push should send PUT request with basic auth data', () => {
				const mockHttp = nock(`http://${auth}@192.168.99.100:9091`)
					.put(
						'/metrics/job/testJob',
						'# HELP test test\n# TYPE test counter\ntest 100\n',
					)
					.reply(200);

				return instance.push({ jobName: 'testJob' }).then(() => {
					expect(mockHttp.isDone());
				});
			});

			it('delete should send DELETE request with basic auth data', () => {
				const mockHttp = nock(`http://${auth}@192.168.99.100:9091`)
					.delete('/metrics/job/testJob')
					.reply(200);

				return instance.delete({ jobName: 'testJob' }).then(() => {
					expect(mockHttp.isDone());
				});
			});
		});

		it('should be possible to extend http/s requests with options', () => {
			const mockHttp = nock('http://192.168.99.100:9091', {
				reqheaders: {
					'unit-test': '1',
				},
			})
				.put(
					'/metrics/job/testJob',
					'# HELP test test\n# TYPE test counter\ntest 100\n',
				)
				.reply(200);

			instance = new Pushgateway(
				'http://192.168.99.100:9091',
				{
					headers: {
						'unit-test': '1',
					},
				},
				registry,
			);

			return instance.push({ jobName: 'testJob' }).then(() => {
				expect(mockHttp.isDone());
			});
		});
	};

	describe('global registry', () => {
		afterEach(() => {
			register.clear();
		});

		beforeEach(() => {
			registry = undefined;
			instance = new Pushgateway('http://192.168.99.100:9091');
			const promClient = require('../index');
			const cnt = new promClient.Counter({ name: 'test', help: 'test' });
			cnt.inc(100);
		});

		tests();
	});

	describe('registry instance', () => {
		afterEach(() => {
			register.clear();
		});

		beforeEach(() => {
			registry = new Registry();
			instance = new Pushgateway('http://192.168.99.100:9091', null, registry);
			const promeClient = require('../index');
			const cnt = new promeClient.Counter({
				name: 'test',
				help: 'test',
				registers: [registry],
			});
			cnt.inc(100);
		});

		tests();
	});
});

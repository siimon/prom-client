'use strict';

const httpMocks = {
	on: jest.fn(),
	end: jest.fn(),
	write: jest.fn(),
};
const mockHttp = jest.fn().mockReturnValue(httpMocks);

jest.mock('http', () => {
	return {
		request: mockHttp,
	};
});

const payload = `# HELP test test
# TYPE test counter
test 100
`;

describe('pushgateway', () => {
	const Pushgateway = require('../index').Pushgateway;
	const register = require('../index').register;
	const Registry = require('../index').Registry;
	let instance;
	let registry = undefined;

	const tests = function () {
		describe('pushAdd', () => {
			it('should push metrics', () => {
				instance.pushAdd({ jobName: 'testJob' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('POST');
				expect(invocation.path).toEqual('/metrics/job/testJob');
			});

			it('should use groupings', () => {
				instance.pushAdd({ jobName: 'testJob', groupings: { key: 'value' } });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('POST');
				expect(invocation.path).toEqual('/metrics/job/testJob/key/value');
			});

			it('should escape groupings', () => {
				instance.pushAdd({ jobName: 'testJob', groupings: { key: 'va&lue' } });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('POST');
				expect(invocation.path).toEqual('/metrics/job/testJob/key/va%26lue');
			});

			it('should write the payload', () => {
				instance.pushAdd({ jobName: 'testJob' });

				return instance.registry.metrics().then(() => {
					expect(httpMocks.write).toBeCalledTimes(1);
					expect(httpMocks.end).toBeCalledTimes(1);
					expect(httpMocks.write).toHaveBeenCalledWith(payload);
				});
			});
		});

		describe('push', () => {
			it('should push with PUT', () => {
				instance.push({ jobName: 'testJob' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('PUT');
				expect(invocation.path).toEqual('/metrics/job/testJob');
			});

			it('should uri encode url', () => {
				instance.push({ jobName: 'test&Job' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('PUT');
				expect(invocation.path).toEqual('/metrics/job/test%26Job');
			});

			it('should write the payload', () => {
				instance.push({ jobName: 'test&Job' });

				return instance.registry.metrics().then(() => {
					expect(httpMocks.write).toBeCalledTimes(1);
					expect(httpMocks.end).toBeCalledTimes(1);
					expect(httpMocks.write).toHaveBeenCalledWith(payload);
				});
			});
		});

		describe('delete', () => {
			it('should push delete with no body', () => {
				instance.delete({ jobName: 'testJob' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('DELETE');
				expect(invocation.path).toEqual('/metrics/job/testJob');
			});

			it('should not write a payload', () => {
				instance.delete({ jobName: 'testJob' });

				expect(httpMocks.end).toBeCalledTimes(1);
				expect(httpMocks.write).toBeCalledTimes(0);
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
				instance.pushAdd({ jobName: 'testJob' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('POST');
				expect(invocation.auth).toEqual(auth);
			});

			it('push should send PUT request with basic auth data', () => {
				instance.push({ jobName: 'testJob' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('PUT');
				expect(invocation.auth).toEqual(auth);
			});

			it('delete should send DELETE request with basic auth data', () => {
				instance.delete({ jobName: 'testJob' });

				expect(mockHttp).toHaveBeenCalledTimes(1);
				const invocation = mockHttp.mock.calls[0][0];
				expect(invocation.method).toEqual('DELETE');
				expect(invocation.auth).toEqual(auth);
			});
		});

		it('should be possible to extend http/s requests with options', () => {
			instance = new Pushgateway(
				'http://192.168.99.100:9091',
				{
					headers: {
						'unit-test': '1',
					},
				},
				registry,
			);

			instance.push({ jobName: 'testJob' });

			expect(mockHttp).toHaveBeenCalledTimes(1);
			const invocation = mockHttp.mock.calls[0][0];
			expect(invocation.headers).toEqual({ 'unit-test': '1' });
		});
	};
	describe('global registry', () => {
		afterEach(() => {
			mockHttp.mockClear();
			register.clear();
		});
		beforeEach(() => {
			httpMocks.write.mockClear();
			httpMocks.end.mockClear();
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
			mockHttp.mockClear();
		});
		beforeEach(() => {
			httpMocks.write.mockClear();
			httpMocks.end.mockClear();
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

'use strict';

const exec = require('child_process').execSync;

describe('processMaxFileDescriptors', () => {
	const register = require('../../index').register;
	const processMaxFileDescriptors = require('../../lib/metrics/processMaxFileDescriptors');

	beforeAll(() => {
		register.clear();
	});

	afterEach(() => {
		register.clear();
	});

	if (process.platform !== 'linux') {
		it('should not add metric to the registry', () => {
			expect(register.getMetricsAsJSON()).toHaveLength(0);

			processMaxFileDescriptors()();

			expect(register.getMetricsAsJSON()).toHaveLength(0);
		});
	} else {
		it('should add metric to the registry', () => {
			expect(register.getMetricsAsJSON()).toHaveLength(0);

			processMaxFileDescriptors()();

			const metrics = register.getMetricsAsJSON();

			expect(metrics).toHaveLength(1);
			expect(metrics[0].help).toEqual(
				'Maximum number of open file descriptors.',
			);
			expect(metrics[0].type).toEqual('gauge');
			expect(metrics[0].name).toEqual('process_max_fds');
			expect(metrics[0].values).toHaveLength(1);
		});

		it('should have a reasonable metric value', done => {
			const maxFiles = Number(exec('ulimit -Hn', { encoding: 'utf8' }));

			expect(register.getMetricsAsJSON()).toHaveLength(0);
			processMaxFileDescriptors(register, { ready })();

			function ready() {
				const metrics = register.getMetricsAsJSON();

				expect(metrics).toHaveLength(1);
				expect(metrics[0].values).toHaveLength(1);

				expect(metrics[0].values[0].value).toBeLessThanOrEqual(maxFiles);
				expect(metrics[0].values[0].value).toBeGreaterThan(0);

				return done();
			}
		});
	}
});

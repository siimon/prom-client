'use strict';

describe('validation', () => {
	describe('validateMetricName', () => {
		const { validateMetricName } = require('../lib/validation');

		it('should validate a valid metric name', () => {
			const validName =
				'instance:node_cpu_used_percent:100x_sum_rate_divideNCPU';
			expect(validateMetricName(validName)).toEqual(true);
		});

		it('should not validate an invalid metric name', () => {
			expect(validateMetricName(['a counter'])).toEqual(false);
		});
	});

	describe('validateLabelName', () => {
		const { validateLabelName } = require('../lib/validation');

		it('should validate a valid label name', () => {
			const validNames = ['method', 'METHOD', 'net_iface', 'k8s_version'];
			expect(validateLabelName(validNames)).toEqual(true);
		});

		it('should not validate an invalid label name', () => {
			expect(validateLabelName(['/etc/issue'])).toEqual(false);
		});
	});

	describe('validateLabel', () => {
		const validateLabel = require('../lib/validation').validateLabel;

		it('should not throw on known label', () => {
			expect(() => {
				validateLabel(['exists'], { exists: null });
			}).not.toThrowError();
		});

		it('should throw on unknown label', () => {
			expect(() => {
				validateLabel(['exists'], { somethingElse: null });
			}).toThrowError(
				'Added label "somethingElse" is not included in initial labelset: [ \'exists\' ]',
			);
		});
	});

	describe('strictLabelNames', () => {
		const Counter = require('../lib/counter');
		const Gauge = require('../lib/gauge');

		it('should not throw on unknown label by default', () => {
			const c = new Counter({
				name: 'api_complete_requests_total',
				help: 'number of requests completed as a counter',
				labelNames: ['method', 'status_code'],
			});
			expect(() => {
				c.inc({
					method: 'PATCH',
					status_code: '409',
					path: '/device/v2/:uuid/state',
					queue: 'state_patch',
				});
			}).not.toThrowError();
		});

		it('should throw on unknown label if strictLabelNames: true', () => {
			const g = new Gauge({
				name: 'api_complete_requests_inflight',
				help: 'number of requests currently being processed',
				labelNames: ['method', 'path'],
				strictLabelNames: true,
			});
			expect(() => {
				g.set(
					{
						method: 'GET',
						path: '/device/v2/:uuid/state',
						queue: 'state_patch',
					},
					550,
				);
			}).toThrowError(
				"Added label \"queue\" is not included in initial labelset: [ 'method', 'path' ]",
			);
		});
	});
});

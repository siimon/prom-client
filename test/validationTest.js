'use strict';

describe('validation', () => {
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
				'Added label "somethingElse" is not included in initial labelset: [ \'exists\' ]'
			);
		});
	});

	describe('normalize metric', () => {
		const { normalizeMetricName } = require('../lib/validation');
		it('transform invalid middle chars to underscore', () => {
			expect(normalizeMetricName('a&&&&^%b')).toEqual('a_b');
		});

		it('ignore invalid chars at head', () => {
			expect(normalizeMetricName('123&&&a-b')).toEqual('a_b');
		});

		it('preserve digits in middle', () => {
			expect(normalizeMetricName('a-b12:%')).toEqual('a_b12:_');
		});
	});

	describe('normalize label', () => {
		const normalize = require('../lib/validation').normalizeLabelName;
		it('preserve digits in middle', () => {
			expect(normalize('a-b12:%')).toEqual('a_b12_');
		});
	});
});

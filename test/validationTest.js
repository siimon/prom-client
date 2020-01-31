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
});

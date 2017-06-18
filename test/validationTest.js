'use strict';

describe('validation', function() {
	describe('validateLabel', function() {
		var validateLabel = require('../lib/validation').validateLabel;

		it('should not throw on known label', function() {
			expect(function() {
				validateLabel(['exists'], { exists: null });
			}).not.toThrowError();
		});

		it('should throw on unknown label', function() {
			expect(function() {
				validateLabel(['exists'], { somethingElse: null });
			}).toThrowError(
				'Added label "somethingElse" is not included in initial labelset: [ \'exists\' ]'
			);
		});
	});
});

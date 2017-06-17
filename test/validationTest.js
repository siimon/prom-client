'use strict';

describe('validation', function() {
	const expect = require('chai').expect;

	describe('validateLabel', function() {
		const validateLabel = require('../lib/validation').validateLabel;

		it('should not throw on known label', function() {
			expect(function() {
				validateLabel(['exists'], {exists: null});
			}).not.to.throw();
		});

		it('should throw on unknown label', function() {
			expect(function() {
				validateLabel(['exists'], {somethingElse: null});
			}).to.throw('Added label "somethingElse" is not included in initial labelset: [ \'exists\' ]');
		});
	});
});

'use strict';

describe('validation', () => {
	const expect = require('chai').expect;

	describe('validateLabel', () => {
		const validateLabel = require('../lib/validation').validateLabel;

		it('should not throw on known label', () => {
			expect(() => {
				validateLabel(['exists'], {exists: null});
			}).not.to.throw();
		});

		it('should throw on unknown label', () => {
			expect(() => {
				validateLabel(['exists'], {somethingElse: null});
			}).to.throw('Added label "somethingElse" is not included in initial labelset: [ \'exists\' ]');
		});
	});
});

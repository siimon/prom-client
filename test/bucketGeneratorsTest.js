'use strict';

describe('bucketGenerators', function() {
	var mocha = require('mocha');
	var expect = require('chai').expect;
	var linearBuckets = require('../index').linearBuckets;
	var exponentialBuckets = require('../index').exponentialBuckets;

	var result;
	describe('linear buckets', function() {
		beforeEach(function() {
			result = linearBuckets(0, 50, 10);
		});

		it('should start on 0', function() {
			expect(result[0]).to.equal(0);
		});
		it('should return 10 buckets', function() {
			expect(result).to.have.length(10);
		});
		it('should have width 50 between buckets', function() {
			expect(result[1] - result[0]).to.equal(50);
			expect(result[9] - result[8]).to.equal(50);
			expect(result[4] - result[3]).to.equal(50);
		});
		it('should not allow negative count', function() {
			var fn = function() { linearBuckets(2, 1, 0); };
			expect(fn).to.throw(Error);
		});
	});

	describe('exponential buckets', function() {
		beforeEach(function() {
			result = exponentialBuckets(1, 2, 5);
		});

		it('should start at start value', function() {
			expect(result[0]).to.equal(1);
		});
		it('should return 5 items', function() {
			expect(result).to.have.length(5);
		});
		it('should increment with a factor of 2', function() {
			expect(result[1] / result[0]).to.equal(2);
			expect(result[3] / result[2]).to.equal(2);
		});

		it('should not allow factor of equal or less than 1', function() {
			var fn = function() { exponentialBuckets(1, 1, 5); };
			expect(fn).to.throw(Error);
		});
		it('should not allow negative start', function() {
			var fn = function() { exponentialBuckets(0, 1, 5); };
			expect(fn).to.throw(Error);
		});
		it('should not allow negative count', function() {
			var fn = function() { exponentialBuckets(2, 10, 0); };
			expect(fn).to.throw(Error);
		});
	});
});

/*
 * TDigest tests - adapted from tdigest package
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 Will Welch
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { TDigest } = require('../../lib/tdigest/tdigest');

describe('T-Digests in which each point becomes a centroid', () => {
	it('consumes a point', () => {
		const tdigest = new TDigest();
		tdigest.push(0);
		const points = tdigest.toArray();
		assert.deepStrictEqual(points, [{ mean: 0, n: 1 }]);
	});

	it('consumes two points', () => {
		const tdigest = new TDigest();
		tdigest.push([0, 1]);
		const points = tdigest.toArray();
		assert.deepStrictEqual(points, [
			{ mean: 0, n: 1 },
			{ mean: 1, n: 1 },
		]);
	});

	it('consumes three points', () => {
		const tdigest = new TDigest();
		tdigest.push([0, 1, -1]);
		const points = tdigest.toArray();
		assert.deepStrictEqual(points, [
			{ mean: -1, n: 1 },
			{ mean: 0, n: 1 },
			{ mean: 1, n: 1 },
		]);
	});

	it('consumes increasing-valued points', () => {
		const tdigest = new TDigest(0.001, 0); // force a new centroid for each pt
		let i;
		const N = 100;
		for (i = 0; i < N; i += 1) {
			tdigest.push(i * 10);
		}
		const points = tdigest.toArray();
		for (i = 0; i < N; i += 1) {
			assert.strictEqual(points[i].mean, i * 10);
		}
	});

	it('consumes decreasing-valued points', () => {
		const tdigest = new TDigest(0.001, 0); // force a new centroid for each pt
		let i;
		const N = 100;
		for (i = N - 1; i >= 0; i = i - 1) {
			tdigest.push(i * 10);
		}
		const points = tdigest.toArray();
		for (i = 0; i < N; i += 1) {
			assert.strictEqual(points[i].mean, i * 10);
		}
	});
});

describe('T-Digests in which points are merged into centroids', () => {
	it('consumes same-valued points into a single point', () => {
		const tdigest = new TDigest();
		let i;
		const N = 100;
		for (i = 0; i < N; i = i + 1) {
			tdigest.push(1000);
		}
		const points = tdigest.toArray();
		assert.deepStrictEqual(points, [{ mean: 1000, n: N }]);
	});

	it('handles multiple duplicates', () => {
		const tdigest = new TDigest(1, 0, 0);
		let i;
		const N = 10;
		for (i = 0; i < N; i++) {
			tdigest.push(0.0);
			tdigest.push(1.0);
			tdigest.push(0.5);
		}
		assert.deepStrictEqual(tdigest.toArray(), [
			{ mean: 0.0, n: N },
			{ mean: 0.5, n: N },
			{ mean: 1.0, n: N },
		]);
	});
});

describe('compress', () => {
	it('compresses points and preserves bounds', () => {
		const tdigest = new TDigest(0.001, 0);
		let i;
		const N = 100;
		for (i = 0; i < N; i += 1) {
			tdigest.push(i * 10);
		}
		assert.strictEqual(tdigest.size(), 100);
		tdigest.delta = 0.1; // encourage merging (don't do this!)
		tdigest.compress();
		const points = tdigest.toArray();
		assert.ok(points.length < 100);
		assert.strictEqual(points[0].mean, 0);
		assert.strictEqual(points[points.length - 1].mean, (N - 1) * 10);
	});

	it('K automatically compresses during ingest', () => {
		const tdigest = new TDigest();
		let i;
		const N = 10000;
		for (i = 0; i < N; i += 1) {
			tdigest.push(i * 10);
		}
		const points = tdigest.toArray();
		assert.ok(tdigest.nreset > 1);
		assert.ok(points.length < 10000);
		assert.strictEqual(points[0].mean, 0);
		assert.strictEqual(points[points.length - 1].mean, 99990);
	});
});

describe('percentile ranks', () => {
	//
	// TDigests are really meant for large datasets and continuous
	// distributions.  On small or categorical sets, results can seem
	// strange because mass exists at boundary points. The small tests
	// here verify some precise behaviors that may not be relevant at
	// scale.
	//
	it('reports undefined when given no points', () => {
		const tdigest = new TDigest();
		const x = [1, 2, 3];
		assert.deepStrictEqual(tdigest.p_rank(1), undefined);
		assert.deepStrictEqual(tdigest.p_rank(x), [
			undefined,
			undefined,
			undefined,
		]);
	});

	it('from a single point', () => {
		const tdigest = new TDigest();
		tdigest.push(0);
		const x = [-0.5, 0, 0.5, 1.0, 1.5];
		const q = [0, 0.5, 1, 1, 1];
		assert.deepStrictEqual(tdigest.p_rank(x), q);
	});

	it('from two points', () => {
		const tdigest = new TDigest();
		tdigest.push([0, 1]);
		const x = [-0.5, 0, 0.5, 1.0, 1.5];
		const q = [0, 0.25, 0.5, 0.75, 1];
		assert.deepStrictEqual(tdigest.p_rank(x), q);
	});

	it('from three points', () => {
		const tdigest = new TDigest();
		tdigest.push([-1, 0, 1]);
		const x = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
		const q = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
		assert.deepStrictEqual(tdigest.p_rank(x), q);
	});

	it('from three points is same as from multiples of those points', () => {
		const tdigest = new TDigest();
		tdigest.push([0, 1, -1]);
		const x = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
		const result1 = tdigest.p_rank(x);
		tdigest.push([0, 1, -1]);
		tdigest.push([0, 1, -1]);
		const result2 = tdigest.p_rank(x);
		assert.deepStrictEqual(result1, result2);
	});

	it('from four points away from the origin', () => {
		const tdigest = new TDigest();
		tdigest.push([10, 11, 12, 13]);
		const x = [9, 10, 11, 12, 13, 14];
		const q = [0, 1 / 8, 3 / 8, 5 / 8, 7 / 8, 1];
		assert.deepStrictEqual(tdigest.p_rank(x), q);
	});

	it('from four points is same as from multiples of those points', () => {
		const tdigest = new TDigest(0, 0);
		tdigest.push([10, 11, 12, 13]);
		const x = [9, 10, 11, 12, 13, 14];
		const result1 = tdigest.p_rank(x);
		tdigest.push([10, 11, 12, 13]);
		tdigest.push([10, 11, 12, 13]);
		const result2 = tdigest.p_rank(x);
		assert.deepStrictEqual(result1, result2);
	});

	it('from lots of uniformly distributed points', () => {
		const tdigest = new TDigest();
		let i;
		const x = [];
		const N = 100000;
		let maxerr = 0;
		for (i = 0; i < N; i += 1) {
			x.push(Math.random());
		}
		tdigest.push(x);
		tdigest.compress();
		for (i = 0.01; i <= 1; i += 0.01) {
			const q = tdigest.p_rank(i);
			maxerr = Math.max(maxerr, Math.abs(i - q));
		}
		assert.ok(maxerr < 0.01);
	});

	it('from an exact match', () => {
		const tdigest = new TDigest(0.001, 0); // no compression
		let i;
		const N = 10;
		for (i = 0; i < N; i += 1) {
			tdigest.push([10, 20, 30]);
		}
		assert.strictEqual(tdigest.p_rank(20), 0.5);
	});
});

describe('percentiles', () => {
	it('reports undefined when given no points', () => {
		const tdigest = new TDigest();
		const p = [0, 0.5, 1.0];
		assert.deepStrictEqual(tdigest.percentile(0.5), undefined);
		assert.deepStrictEqual(tdigest.percentile(p), [
			undefined,
			undefined,
			undefined,
		]);
	});

	it('from a single point', () => {
		const tdigest = new TDigest();
		tdigest.push(0);
		const p = [0, 0.5, 1.0];
		const x = [0, 0, 0];
		assert.deepStrictEqual(tdigest.percentile(p), x);
	});

	it('from two points', () => {
		const tdigest = new TDigest();
		tdigest.push([0, 1]);
		const p = [-1 / 4, 0, 1 / 4, 1 / 2, 5 / 8, 3 / 4, 1, 1.25];
		const x = [0, 0, 0, 0.5, 0.75, 1, 1, 1];
		assert.deepStrictEqual(tdigest.percentile(p), x);
	});

	it('from three points', () => {
		const tdigest = new TDigest();
		tdigest.push([0, 0.5, 1]);
		const p = [0, 1 / 4, 1 / 2, 3 / 4, 1];
		const x = [0, 0.125, 0.5, 0.875, 1.0];
		assert.deepStrictEqual(tdigest.percentile(p), x);
	});

	it('from four points', () => {
		const tdigest = new TDigest();
		tdigest.push([10, 11, 12, 13]);
		const p = [0, 1 / 4, 1 / 2, 3 / 4, 1];
		const x = [10.0, 10.5, 11.5, 12.5, 13.0];
		assert.deepStrictEqual(tdigest.percentile(p), x);
	});

	it('from lots of uniformly distributed points', () => {
		const tdigest = new TDigest();
		let i;
		const x = [];
		const N = 100000;
		let maxerr = 0;
		for (i = 0; i < N; i += 1) {
			x.push(Math.random());
		}
		tdigest.push(x);
		tdigest.compress();
		for (i = 0.01; i <= 1; i += 0.01) {
			const q = tdigest.percentile(i);
			maxerr = Math.max(maxerr, Math.abs(i - q));
		}
		assert.ok(maxerr < 0.01);
	});
});

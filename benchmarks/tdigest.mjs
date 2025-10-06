import { group, bench, run } from 'mitata';
import { TDigest } from '../lib/tdigest/tdigest.js';

// Benchmark TDigest operations with various data sizes and patterns

group('TDigest push operations', () => {
	bench('push single value', () => {
		const td = new TDigest();
		td.push(42);
	});

	bench('push 100 sequential values', () => {
		const td = new TDigest();
		for (let i = 0; i < 100; i++) {
			td.push(i);
		}
	});

	bench('push 1000 sequential values', () => {
		const td = new TDigest();
		for (let i = 0; i < 1000; i++) {
			td.push(i);
		}
	});

	bench('push 100 random values', () => {
		const td = new TDigest();
		for (let i = 0; i < 100; i++) {
			td.push(Math.random() * 1000);
		}
	});

	bench('push 1000 random values', () => {
		const td = new TDigest();
		for (let i = 0; i < 1000; i++) {
			td.push(Math.random() * 1000);
		}
	});

	bench('push array of 100 values', () => {
		const td = new TDigest();
		const values = Array.from({ length: 100 }, (_, i) => i);
		td.push(values);
	});

	bench('push array of 1000 values', () => {
		const td = new TDigest();
		const values = Array.from({ length: 1000 }, (_, i) => i);
		td.push(values);
	});
});

group('TDigest percentile queries', () => {
	const td100 = new TDigest();
	for (let i = 0; i < 100; i++) {
		td100.push(Math.random() * 1000);
	}

	const td1000 = new TDigest();
	for (let i = 0; i < 1000; i++) {
		td1000.push(Math.random() * 1000);
	}

	const td10000 = new TDigest();
	for (let i = 0; i < 10000; i++) {
		td10000.push(Math.random() * 1000);
	}

	bench('percentile(0.5) with 100 values', () => {
		td100.percentile(0.5);
	});

	bench('percentile(0.5) with 1000 values', () => {
		td1000.percentile(0.5);
	});

	bench('percentile(0.5) with 10000 values', () => {
		td10000.percentile(0.5);
	});

	bench('percentile(0.95) with 1000 values', () => {
		td1000.percentile(0.95);
	});

	bench('percentile(0.99) with 1000 values', () => {
		td1000.percentile(0.99);
	});

	bench('multiple percentiles with 1000 values', () => {
		td1000.percentile([0.5, 0.9, 0.95, 0.99]);
	});
});

group('TDigest compress operations', () => {
	bench('compress after 100 values', () => {
		const td = new TDigest();
		for (let i = 0; i < 100; i++) {
			td.push(Math.random() * 1000);
		}
		td.compress();
	});

	bench('compress after 1000 values', () => {
		const td = new TDigest();
		for (let i = 0; i < 1000; i++) {
			td.push(Math.random() * 1000);
		}
		td.compress();
	});

	bench('compress after 10000 values', () => {
		const td = new TDigest();
		for (let i = 0; i < 10000; i++) {
			td.push(Math.random() * 1000);
		}
		td.compress();
	});
});

group('TDigest p_rank operations', () => {
	const td = new TDigest();
	for (let i = 0; i < 1000; i++) {
		td.push(Math.random() * 1000);
	}

	bench('p_rank single value', () => {
		td.p_rank(500);
	});

	bench('p_rank array of values', () => {
		td.p_rank([100, 250, 500, 750, 900]);
	});
});

group('TDigest with different compression factors', () => {
	bench('default compression (0.01)', () => {
		const td = new TDigest();
		for (let i = 0; i < 1000; i++) {
			td.push(Math.random() * 1000);
		}
		td.percentile(0.95);
	});

	bench('low compression (0.001)', () => {
		const td = new TDigest(0.001);
		for (let i = 0; i < 1000; i++) {
			td.push(Math.random() * 1000);
		}
		td.percentile(0.95);
	});

	bench('high compression (0.1)', () => {
		const td = new TDigest(0.1);
		for (let i = 0; i < 1000; i++) {
			td.push(Math.random() * 1000);
		}
		td.percentile(0.95);
	});
});

run();

'use strict';

const createRegressionBenchmark = require('@clevernature/benchmark-regression');
const { Benchmark } = require('benchmark');
const debug = require('debug')('benchmark');

/**
 * Async suite workaround. benchmark-regression forwards no options to
 * benchmark.js from its own suite() and run() functions.
 * And as implemented, benchmark.js only supports async setup()
 * and teardown() functions, not the test itself. Given that benchmark.js is
 * now an archived project, and benchmark-regression hasn't landed a PR since
 * 2018, that situation is unlikely to change soon.
 */

Benchmark.options.defer = true;
Benchmark.options.onStart = event => {
	const benchmark = event.target;
	const name = benchmark.name;
	const original = benchmark.fn;

	debug(`Starting '${name}'`);

	benchmark.fn = async deferred => {
		try {
			await original();
		} catch (e) {
			console.error(e);
		} finally {
			deferred.resolve();
		}
	};
};
Benchmark.options.onAbort = event => {
	console.error(event);
};
Benchmark.options.onError = event => {
	console.error(event);
};

const currentClient = require('..');
const benchmarks = createRegressionBenchmark(
	{ name: 'prom-client@current', module: currentClient },
	['prom-client@latest'],
);

benchmarks.suite('counter', require('./counter'));
benchmarks.suite('gauge', require('./gauge'));
benchmarks.suite('histogram', require('./histogram'));
benchmarks.suite('registry', require('./registry'));
benchmarks.suite('summary', require('./summary'));

benchmarks
	.run()
	.then(() => {
		debug('Process end');
	})
	.catch(err => {
		console.error('Failure', err);
		console.error(err.stack);
		// eslint-disable-next-line n/no-process-exit
		process.exit(1);
	});

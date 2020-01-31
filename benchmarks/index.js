'use strict';

const createRegressionBenchmark = require('@clevernature/benchmark-regression');

const currentClient = require('..');
const benchmarks = createRegressionBenchmark(currentClient, [
	'prom-client@latest',
]);

benchmarks.suite('registry', require('./registry'));
benchmarks.suite('histogram', require('./histogram'));
benchmarks.suite('summary', require('./summary'));
benchmarks.run().catch(err => {
	console.error(err.stack);
	// eslint-disable-next-line no-process-exit
	process.exit(1);
});

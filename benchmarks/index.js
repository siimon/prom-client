'use strict';

const chalk = require('chalk');
const createSuites = require('./utils/create-suites');
const reportResults = require('./utils/report-results');

runSuite();

function runSuite() {
	console.log(chalk.yellow('\nProgress:'));

	// Add new test suites here.
	const suites = [
		createSuites('registry', require('./registry')),
		createSuites('histogram', require('./histogram'))
	];

	return Promise.all(suites)
		.then(reportResults)
		.catch(err => {
			console.log('\n');
			console.error(err.stack);

			// eslint-disable-next-line no-process-exit
			process.exit(1);
		});
}

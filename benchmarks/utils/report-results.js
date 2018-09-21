'use strict';

const { table } = require('table');
const _ = require('lodash');
const chalk = require('chalk');
// Percentage (between 0 and 100) slower we will allow local changes to be than published version.
// This will account for no-op performance changes having a variance difference between versions.
const ACCEPTABLE_PERCENTAGE_SLOWER = 7.0;

module.exports = reportResults;

function reportResults(resultSuites) {
	const suites = _.flatten(resultSuites);

	const collectionTables = {};
	_.flatMap(suites, suite => {
		const [fastest] = suite.filter('fastest').map('name');

		suite.each(benchmark => {
			const [clientName, collectionName, ...nameParts] = benchmark.name.split(
				'#'
			);
			const benchmarkName = nameParts.join('#');

			const collectionTable = (collectionTables[
				collectionName
			] = collectionTables[collectionName] || {
				published: {},
				local: {}
			});

			collectionTable[clientName][benchmarkName] = {
				value: `${benchmark.hz} ops/sec`,
				fastest: benchmark.name === fastest
			};
		});
	});

	console.log(chalk.yellow('\nResults:'));

	_.forEach(collectionTables, (collectionTable, collectionName) => {
		const columnNames = _.keys(collectionTable);
		const rowNames = _.keys(collectionTable.local);

		const tableData = [[chalk.blue(collectionName)].concat(columnNames)].concat(
			_.map(rowNames, rowName =>
				[rowName].concat(
					_.map(columnNames, columnName => {
						const { value, fastest } = collectionTable[columnName][rowName];
						const color = fastest ? chalk.green : chalk.red;

						return color(value);
					})
				)
			)
		);

		console.log(table(tableData));
	});

	console.log(chalk.yellow('Summary:'));

	let overallSuccess = true;
	suites.forEach(suite => {
		const [fastestName] = suite.filter('fastest').map('name');
		const [fastestClientName, ...nameParts] = fastestName.split('#');
		const benchmarkName = nameParts.join('#');

		const [fastestHz] = suite.filter('fastest').map('hz');
		const [slowestHz] = suite.filter('slowest').map('hz');
		const changeInSpeed = fastestHz - slowestHz;
		const percentChange = Math.abs((changeInSpeed / slowestHz) * 100);
		const prettyPercentChange = Number.parseFloat(percentChange).toPrecision(4);

		const isFaster = fastestClientName === 'local';
		const isAcceptable = percentChange <= ACCEPTABLE_PERCENTAGE_SLOWER;

		const success = isFaster || isAcceptable;

		overallSuccess = overallSuccess && success;

		let statusSymbol;
		let statusColor;
		let speed;

		if (isFaster) {
			speed = 'faster';
			statusSymbol = '✓';
			statusColor = chalk.green;
		} else if (isAcceptable) {
			speed = 'acceptably slower';
			statusSymbol = '⚠';
			statusColor = chalk.yellow;
		} else {
			speed = 'slower';
			statusSymbol = '✗';
			statusColor = chalk.red;
		}

		console.log(
			`${statusColor(statusSymbol)} ${benchmarkName} is ${statusColor(
				`${prettyPercentChange}% ${speed}.`
			)}`
		);
	});

	if (!overallSuccess) {
		throw new Error(
			'Benchmarks failed to perform better than the currently published version.'
		);
	}
}

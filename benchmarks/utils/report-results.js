'use strict';

const Table = require('cli-table');
const _ = require('lodash');
const chalk = require('chalk');
// Percentage (between 0 and 100) slower we will allow local changes to be than published version.
// This will account for no-op performance changes having a variance difference between versions.
const ACCEPTABLE_PERCENTAGE_SLOWER = 10.0;

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

		const table = new Table({
			head: [chalk.blue(collectionName)].concat(columnNames)
		});

		_.forEach(rowNames, rowName => {
			table.push(
				[rowName].concat(
					_.map(columnNames, columnName => {
						const { value, fastest } = collectionTable[columnName][rowName];
						const color = fastest ? chalk.green : chalk.red;

						return color(value);
					})
				)
			);
		});

		console.log(`${table.toString()}\n`);
	});

	console.log(chalk.yellow('Summary:'));

	let overallSuccess = true;
	suites.forEach(suite => {
		const fastest = suite.filter('fastest')[0];
		const slowest = suite.filter('slowest')[0];

		const [fastestClientName, ...nameParts] = fastest.name.split('#');
		const benchmarkName = nameParts.join('#');

		const percentChange = computePercentChange(fastest, slowest);

		const isFaster = fastestClientName === 'local';
		const isAcceptable = percentChange.value <= ACCEPTABLE_PERCENTAGE_SLOWER;

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
				`${percentChange.prettyValue}% ${speed}.`
			)}`
		);
	});

	if (!overallSuccess) {
		console.log('\n');
		console.log(
			chalk.red(
				'⚠ Benchmarks failed to perform better than the currently published version.'
			)
		);
		console.log(
			chalk.yellow(
				'- Please determine if the performance changes are expected and acceptable.'
			)
		);
	}
}

function computePercentChange(slowestBenchmark, fastestBenchmark) {
	const fastestHz = fastestBenchmark.hz;
	const slowestHz = slowestBenchmark.hz;
	const delta = fastestHz - slowestHz;
	const percentChange = Math.abs((delta / slowestHz) * 100);
	const prettyPercentChange = Number.parseFloat(percentChange).toPrecision(4);

	return {
		value: percentChange,
		prettyValue: prettyPercentChange
	};
}

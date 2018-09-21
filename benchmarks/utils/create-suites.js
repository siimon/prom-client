'use strict';

const benchmark = require('benchmark');
const publishedClient = require('prom-client');
const localClient = require('../..');
const _ = require('lodash');

module.exports = createSuites;

function createSuites(collectionName, setup) {
	const suites = {};
	const createApi = clientName => {
		return {
			add(name, fn, opts) {
				if (!suites[name]) {
					suites[name] = new benchmark.Suite(name)
						.on('cycle', event => {
							if (!event.target.error) {
								console.log(event.target.toString());
							}
						})
						.on('error', event => {
							console.log(
								`${event.target.toString()}\n${event.target.error.stack}`
							);
						});
				}

				const suite = suites[name];
				suite.add(
					`${clientName}#${collectionName}#${name}`,
					fn,
					Object.assign({ minSamples: 200 }, opts)
				);
			}
		};
	};

	setup(publishedClient, createApi('published'));
	setup(localClient, createApi('local'));

	return Promise.all(
		_.values(suites).map(suite => {
			const resultPromise = new Promise(resolve => {
				suite.on('complete', () => resolve(suite));
			});

			suite.run();

			return resultPromise;
		})
	);
}

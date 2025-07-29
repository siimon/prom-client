'use strict';

module.exports = setupUtilSuite;

function setupUtilSuite(suite) {
	suite.add(
		'hashObject',
		(client, Util) => {
			if (Util === undefined) {
				return;
			}

			Util.hashObject({
				foo: 'longish',
				user_agent: 'Chrome',
				gateway: 'lb04',
				method: 'get',
				status_code: 200,
				phase: 'load',
			});
		},
		{ setup: findUtil },
	);

	suite.add(
		'LabelMap.validate()',
		(client, labelMap) => {
			if (labelMap === undefined) {
				return;
			}

			labelMap.validate({
				foo: 'longish',
				user_agent: 'Chrome',
				gateway: 'lb04',
				method: 'get',
				status_code: 200,
				phase: 'load',
				label1: 4,
			});
		},
		{ setup },
	);

	suite.add(
		'LabelMap.keyFrom()',
		(client, labelMap) => {
			if (labelMap === undefined) {
				return;
			}

			labelMap.keyFrom({
				foo: 'longish',
				user_agent: 'Chrome',
				gateway: 'lb04',
				method: 'get',
				status_code: 301,
				phase: 'load',
				label1: 4,
			});
		},
		{ setup },
	);

	suite.add(
		'LabelGrouper.keyFrom()',
		(client, labelGrouper) => {
			if (labelGrouper === undefined) {
				return;
			}

			labelGrouper.keyFrom({
				foo: 'longish',
				user_agent: 'Chrome',
				gateway: 'lb04',
				method: 'get',
				status_code: 503,
				phase: 'load',
				label1: 4,
			});
		},
		{
			setup: client => {
				const Util = findUtil(client);

				return Util && new Util.LabelGrouper();
			},
		},
	);
}

function setup(client) {
	const Util = findUtil(client);

	if (Util !== undefined) {
		return new Util.LabelMap([
			'foo',
			'user_agent',
			'gateway',
			'method',
			'status_code',
			'phase',
			'label1',
		]);
	}
}

function findUtil(client) {
	for (const key of Object.getOwnPropertySymbols(client)) {
		if (key.toString() === 'Symbol(util)') {
			return client[key];
		}
	}
}

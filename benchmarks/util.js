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
				foo: 'longish:tag:goes:here',
				user_agent: 'Chrome',
				status_code: 503,
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
				status_code: 503,
			});
		},
		{ setup },
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

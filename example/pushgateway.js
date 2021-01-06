'use strict';

const client = require('../index');

function run() {
	const Registry = client.Registry;
	const register = new Registry();
	const gateway = new client.Pushgateway('http://127.0.0.1:9091', [], register);
	const prefix = 'dummy_prefix_name';

	const test = new client.Counter({
		name: `${prefix}_test`,
		help: `${prefix}_test`,
		registers: [register],
	});
	register.registerMetric(test);
	test.inc(10);

	return gateway
		.push({ jobName: prefix })
		.then(({ resp, body }) => {
			console.log(`Body: ${body}`);
			console.log(`Response status: ${resp.statusCode}`);
		})
		.catch(err => {
			console.log(`Error: ${err}`);
		});
}

run();

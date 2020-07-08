'use strict';

const client = require('prom-client');

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

	gateway.push({ jobName: prefix }, (err, resp, body) => {
		console.log(`Error: ${err}`);
		console.log(`Body: ${body}`);
		console.log(`Response status: ${resp.statusCode}`);
	});
}

run();

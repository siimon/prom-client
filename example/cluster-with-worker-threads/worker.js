'use strict';

const { Counter } = require('../..');
const {
	Worker,
	isMainThread,
	parentPort,
	threadId,
} = require('worker_threads');

if (isMainThread) {
	module.exports = () =>
		new Promise((resolve, reject) => {
			const worker = new Worker(__filename);

			worker.on('message', resolve);
			worker.on('error', reject);
		});
} else {
	const worker_invocation_total = new Counter({
		name: 'worker_invocation_total',
		help: 'worker invocation count | threadId="20212"',
		labelNames: ['threadId'],
	});

	worker_invocation_total.inc({ threadId });

	parentPort.postMessage(`result: ${Math.random()}`);
}

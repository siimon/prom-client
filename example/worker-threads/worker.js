'use strict';

const { Counter } = require('../..');
const {
	Worker,
	isMainThread,
	parentPort,
	threadId,
} = require('worker_threads');

if (isMainThread) {
	const worker = new Worker(__filename);

	module.exports.workers = [worker];
	module.exports.calculate = () =>
		new Promise((resolve, reject) => {
			worker.emit('message', resolve);
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

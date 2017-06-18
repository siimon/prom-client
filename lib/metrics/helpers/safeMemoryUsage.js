'use strict';

function safeMemoryUsage() {
	let memoryUsage;
	try {
		memoryUsage = process.memoryUsage();
	} catch (ex) {}

	return memoryUsage;
}

module.exports = safeMemoryUsage;

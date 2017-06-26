'use strict';

function safeMemoryUsage() {
	let memoryUsage;
	try {
		memoryUsage = process.memoryUsage();
	} catch (ex) {
		// empty
	}

	return memoryUsage;
}

module.exports = safeMemoryUsage;

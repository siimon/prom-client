'use strict';

function safeMemoryUsage() {
	var memoryUsage;
	try {
		memoryUsage = process.memoryUsage();
	} catch (ex) {

	}

	return memoryUsage;
}

module.exports = safeMemoryUsage;

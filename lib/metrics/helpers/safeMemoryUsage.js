'use strict';

function safeMemoryUsage() {
	try {
		return process.memoryUsage();
	} catch {
		return;
	}
}

module.exports = safeMemoryUsage;

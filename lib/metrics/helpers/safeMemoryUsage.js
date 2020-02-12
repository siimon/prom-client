'use strict';

function safeMemoryUsage() {
	try {
		return process.memoryUsage();
	} catch (ex) {
		return;
	}
}

module.exports = safeMemoryUsage;

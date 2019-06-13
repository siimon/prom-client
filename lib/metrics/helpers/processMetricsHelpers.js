'use strict';

function aggregateByObjectName(list) {
	const data = {};

	for (let i = 0; i < list.length; i++) {
		const listElement = list[i];

		if (!listElement || typeof listElement.constructor === 'undefined') {
			continue;
		}

		if (data.hasOwnProperty(listElement.constructor.name)) {
			data[listElement.constructor.name] += 1;
		} else {
			data[listElement.constructor.name] = 1;
		}
	}
	return data;
}

function updateMetrics(gauge, data, includeTimestamp) {
	gauge.reset();
	for (const key in data) {
		if (includeTimestamp) {
			gauge.set({ type: key }, data[key], Date.now());
		} else {
			gauge.set({ type: key }, data[key]);
		}
	}
}

module.exports = {
	aggregateByObjectName,
	updateMetrics
};

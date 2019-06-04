'use strict';

function aggregateByObjectName(list) {
	const data = {};

	for (const key in list) {
		if (data.hasOwnProperty(list[key].constructor.name)) {
			data[list[key].constructor.name] += 1;
		} else {
			data[list[key].constructor.name] = 1;
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

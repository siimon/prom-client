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

function updateMetrics(gauge, data) {
	gauge.reset();
	for (const key in data) {
		gauge.set({ type: key }, data[key], Date.now());
	}
}

module.exports = {
	aggregateByObjectName,
	updateMetrics
};

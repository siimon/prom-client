'use strict';

var Gauge = require('../gauge');
var v8;

try {
	v8 = require('v8');
} catch (e) {
	// node version is too old
}

var NODEJS_HEAP_NEW_SPACE_SIZE_TOTAL = 'nodejs_heap_new_space_size_total_bytes';
var NODEJS_HEAP_NEW_SPACE_SIZE_USED = 'nodejs_heap_new_space_size_used_bytes';
var NODEJS_HEAP_NEW_SPACE_SIZE_AVAILABLE = 'nodejs_heap_new_space_size_available_bytes';

var NODEJS_HEAP_OLD_SPACE_SIZE_TOTAL = 'nodejs_heap_old_space_size_total_bytes';
var NODEJS_HEAP_OLD_SPACE_SIZE_USED = 'nodejs_heap_old_space_size_used_bytes';
var NODEJS_HEAP_OLD_SPACE_SIZE_AVAILABLE = 'nodejs_heap_old_space_size_available_bytes';

var NODEJS_HEAP_CODE_SPACE_SIZE_TOTAL = 'nodejs_heap_code_space_size_total_bytes';
var NODEJS_HEAP_CODE_SPACE_SIZE_USED = 'nodejs_heap_code_space_size_used_bytes';
var NODEJS_HEAP_CODE_SPACE_SIZE_AVAILABLE = 'nodejs_heap_code_space_size_available_bytes';

var NODEJS_HEAP_MAP_SPACE_SIZE_TOTAL = 'nodejs_heap_map_space_size_total_bytes';
var NODEJS_HEAP_MAP_SPACE_SIZE_USED = 'nodejs_heap_map_space_size_used_bytes';
var NODEJS_HEAP_MAP_SPACE_SIZE_AVAILABLE = 'nodejs_heap_map_space_size_available_bytes';

var NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_TOTAL = 'nodejs_heap_largeobject_space_size_total_bytes';
var NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_USED = 'nodejs_heap_largeobject_space_size_used_bytes';
var NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_AVAILABLE = 'nodejs_heap_largeobject_space_size_available_bytes';


module.exports = function() {
	if(typeof v8 === 'undefined' || typeof v8.getHeapSpaceStatistics !== 'function') {
		return function() {};
	}

	var gauges = {
		'new_space': {
			total: new Gauge(NODEJS_HEAP_NEW_SPACE_SIZE_TOTAL, 'Process heap new space size from node.js in bytes.'),
			used: new Gauge(NODEJS_HEAP_NEW_SPACE_SIZE_USED, 'Process heap new space size used from node.js in bytes.'),
			available: new Gauge(NODEJS_HEAP_NEW_SPACE_SIZE_AVAILABLE, 'Process heap new space size available from node.js in bytes.')
		},
		'old_space': {
			total: new Gauge(NODEJS_HEAP_OLD_SPACE_SIZE_TOTAL, 'Process heap old space size from node.js in bytes.'),
			used: new Gauge(NODEJS_HEAP_OLD_SPACE_SIZE_USED, 'Process heap old space size used from node.js in bytes.'),
			available: new Gauge(NODEJS_HEAP_OLD_SPACE_SIZE_AVAILABLE, 'Process heap old space size available from node.js in bytes.')
		},
		'code_space': {
			total: new Gauge(NODEJS_HEAP_CODE_SPACE_SIZE_TOTAL, 'Process heap code space size from node.js in bytes.'),
			used: new Gauge(NODEJS_HEAP_CODE_SPACE_SIZE_USED, 'Process heap code space size used from node.js in bytes.'),
			available: new Gauge(NODEJS_HEAP_CODE_SPACE_SIZE_AVAILABLE, 'Process heap code space size available from node.js in bytes.')
		},
		'map_space': {
			total: new Gauge(NODEJS_HEAP_MAP_SPACE_SIZE_TOTAL, 'Process heap map space size from node.js in bytes.'),
			used: new Gauge(NODEJS_HEAP_MAP_SPACE_SIZE_USED, 'Process heap map space size used from node.js in bytes.'),
			available: new Gauge(NODEJS_HEAP_MAP_SPACE_SIZE_AVAILABLE, 'Process heap map space size available from node.js in bytes.')
		},
		'large_object_space': {
			total: new Gauge(NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_TOTAL, 'Process heap large object pace size from node.js in bytes.'),
			used: new Gauge(NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_USED, 'Process heap large object pace size used from node.js in bytes.'),
			available: new Gauge(NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_AVAILABLE, 'Process heap large object pace size available from node.js in bytes.')
		}
	};

	return function() {
		var data = {};
		v8.getHeapSpaceStatistics().forEach(function onEachSpace(space) {
			var gauge = gauges[space.space_name];
			data[space.space_name] = {
				total: space.space_size,
				used: space.space_used_size,
				available: space.space_available_size
			};
			gauge.total.set(space.space_size);
			gauge.used.set(space.space_used_size);
			gauge.available.set(space.space_available_size);
		});

		return data;
	};
};

module.exports.metricNames = [
	NODEJS_HEAP_NEW_SPACE_SIZE_TOTAL,
	NODEJS_HEAP_NEW_SPACE_SIZE_USED,
	NODEJS_HEAP_NEW_SPACE_SIZE_AVAILABLE,

	NODEJS_HEAP_OLD_SPACE_SIZE_TOTAL,
	NODEJS_HEAP_OLD_SPACE_SIZE_USED,
	NODEJS_HEAP_OLD_SPACE_SIZE_AVAILABLE,

	NODEJS_HEAP_CODE_SPACE_SIZE_TOTAL,
	NODEJS_HEAP_CODE_SPACE_SIZE_USED,
	NODEJS_HEAP_CODE_SPACE_SIZE_AVAILABLE,

	NODEJS_HEAP_MAP_SPACE_SIZE_TOTAL,
	NODEJS_HEAP_MAP_SPACE_SIZE_USED,
	NODEJS_HEAP_MAP_SPACE_SIZE_AVAILABLE,

	NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_TOTAL,
	NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_USED,
	NODEJS_HEAP_LARGEOBJECT_SPACE_SIZE_AVAILABLE
];

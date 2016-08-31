'use strict';

var Gauge = require('../gauge');
var nowInSeconds = Math.round(Date.now() / 1000 - process.uptime());

module.exports = function () {
    var cpuUserGauge = new Gauge('process_start_time_seconds', 'Start time of the process since unix epoch in seconds.');
    var isSet = false;

    return function () {
        if(isSet) {
            return;
        }
        cpuUserGauge.set(null, nowInSeconds);
        isSet = true;
    };
};

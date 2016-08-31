'use strict';

var Gauge = require('../gauge');

module.exports = function () {
    // Don't do anything if the function doesn't exist (introduced in node@6.1.0)
    if(typeof process.cpuUsage !== 'function') {
        return function () {
        };
    }

    var cpuUserGauge = new Gauge('process_cpu_seconds_total', 'Total user and system CPU time spent in seconds.');

    return function () {
        var cpuUsage = process.cpuUsage();
        var totalUsageMicros = cpuUsage.user + cpuUsage.system;

        cpuUserGauge.set(null, totalUsageMicros / 1e6);
    };
};

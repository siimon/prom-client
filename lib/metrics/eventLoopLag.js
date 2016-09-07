'use strict';

var Gauge = require('../gauge');

function reportEventloopLag(start, gauge){
    var delta = process.hrtime(start);
    var nanosec = delta[0] * 1e9 + delta[1];
    var ms = nanosec / 1e6;

    gauge.set(Math.round(ms));
}

module.exports = function() {
    var gauge = new Gauge('node_eventloop_lag_milliseconds', 'Lag of event loop in milliseconds.');

    return function() {
        var start = process.hrtime();
        setImmediate(reportEventloopLag, start, gauge);
    };
};

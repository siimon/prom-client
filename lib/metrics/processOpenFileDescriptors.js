'use strict';

var Gauge = require('../gauge');
var fs = require('fs');

module.exports = function () {
    if(process !== 'linux') {
        return function () {
        };
    }

    var fileDescriptorsGauge = new Gauge('process_open_fds', 'Number of open file descriptors.');

    return function () {
        fs.readdir('/proc/self/fd', function (err, list) {
            if(err) {
                return;
            }

            // Minus 1, as this invocation created one
            fileDescriptorsGauge.set(null, list.length - 1);
        });
    };
};

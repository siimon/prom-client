'use strict';

var Gauge = require('../gauge');
var fs = require('fs');

module.exports = function () {
    var isSet = false;

    return function () {
        if(isSet || process.platform !== 'linux') {
            return;
        }

        fs.readFile('/proc/sys/fs/file-max', 'utf8', function (err, maxFds) {
            if(err) {
                return;
            }

            isSet = true;

            var fileDescriptorsGauge = new Gauge('process_max_fds', 'Maximum number of open file descriptors.');

            fileDescriptorsGauge.set(null, maxFds);
        });
    };
};

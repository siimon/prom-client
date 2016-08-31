'use strict';

var Gauge = require('../gauge');
var fs = require('fs');

var values = ['VmSize', 'VmRSS', 'VmData'];

function structureOutput (input) {
    var returnValue = {};

    input.split('\n')
        .filter(function (s) {
            return values.some(function (value) {
                return s.indexOf(value) === 0;
            });
        })
        .forEach(function (string) {
            var split = string.split(':');

            // Get the value
            var value = split[1].trim();
            // Remove trailing ` kb`
            value = value.substr(0, value.length - 3);
            // Make it into a number in bytes bytes
            value = Number(value) * 1000;

            returnValue[split[0]] = value;
        });

    return returnValue;
}

module.exports = function () {
    var residentMemGauge = new Gauge('process_resident_memory_bytes', 'Resident memory size in bytes.');
    var virtualMemGauge = new Gauge('process_virtual_memory_bytes', 'Virtual memory size in bytes.');
    var heapSizeMemGauge = new Gauge('process_heap_bytes', 'Process heap size in bytes.');

    return function () {
        fs.readFile('/proc/self/status', 'utf8', function (err, status) {
            if(err) {
                return;
            }
            var structuredOutput = structureOutput(status);

            residentMemGauge.set(null, structuredOutput.VmRSS);
            virtualMemGauge.set(null, structuredOutput.VmSize);
            heapSizeMemGauge.set(null, structuredOutput.VmData);
        });
    };
};

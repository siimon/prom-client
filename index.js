/**
 * Prometheus client
 * @module Prometheus client
 */

'use strict';

exports.register = require('./lib/register');

exports.Counter = require('./lib/counter');
exports.Gauge = require('./lib/gauge');
exports.Histogram = require('./lib/histogram');
exports.Summary = require('./lib/summary');
exports.Pushgateway = require('./lib/pushgateway');

exports.linearBuckets = require('./lib/bucketGenerators').linearBuckets;
exports.exponentialBuckets = require('./lib/bucketGenerators').exponentialBuckets;

var defaultMetrics = require('./lib/defaultMetrics');

defaultMetrics();

exports.defaultMetrics = defaultMetrics;

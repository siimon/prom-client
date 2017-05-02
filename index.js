/**
 * Prometheus client
 * @module Prometheus client
 */

'use strict';

exports.register = require('./lib/register');
exports.Registry = require('./lib/registry');
exports.contentType = require('./lib/register').contentType;

exports.Counter = require('./lib/counter');
exports.Gauge = require('./lib/gauge');
exports.Histogram = require('./lib/histogram');
exports.Summary = require('./lib/summary');
exports.Pushgateway = require('./lib/pushgateway');

exports.linearBuckets = require('./lib/bucketGenerators').linearBuckets;
exports.exponentialBuckets = require('./lib/bucketGenerators').exponentialBuckets;

exports.collectDefaultMetrics = require('./lib/defaultMetrics');

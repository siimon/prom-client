/**
 * Prometheus client
 * @module Prometheus client
 */

'use strict';

exports.register = require('./lib/registry').globalRegistry;
exports.Registry = require('./lib/registry');
exports.contentType = require('./lib/registry').globalRegistry.contentType;

exports.Counter = require('./lib/counter');
exports.Gauge = require('./lib/gauge');
exports.Histogram = require('./lib/histogram');
exports.Summary = require('./lib/summary');
exports.Pushgateway = require('./lib/pushgateway');

exports.linearBuckets = require('./lib/bucketGenerators').linearBuckets;
exports.exponentialBuckets = require('./lib/bucketGenerators').exponentialBuckets;

exports.collectDefaultMetrics = require('./lib/defaultMetrics');

exports.aggregators = require('./lib/metricAggregators').aggregators;
exports.AggregatorRegistry = require('./lib/cluster');

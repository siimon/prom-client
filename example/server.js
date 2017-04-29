'use strict';

var express = require('express');
var server = express();
var register = require('../lib/register');

var Histogram = require('../').Histogram;
var h = new Histogram({ name: 'test_histogram', help: 'Example of a histogram', labels: [ 'code' ] });

var Counter = require('../').Counter;
var c = new Counter({ name: 'test_counter', help: 'Example of a counter', labels: [ 'code' ] });

var Gauge = require('../').Gauge;
var g = new Gauge({ name: 'test_gauge', help: 'Example of a gauge', labels: [ 'method', 'code' ] });

setTimeout(function() {
	h.labels('200').observe(Math.random());
	h.labels('300').observe(Math.random());
}, 10);

setInterval(function() {
	c.inc({ code: 200 });
}, 5000);

setInterval(function() {
	c.inc({ code: 400 });
}, 2000);

setInterval(function() {
	c.inc();
}, 2000);

setInterval(function() {
	g.set({ method: 'get', code: 200 }, Math.random());
	g.set(Math.random());
	g.labels('post', '300').inc();
}, 100);


server.get('/metrics', function(req, res) {
	res.set('Content-Type', register.contentType);
	res.end(register.metrics());
});

server.get('/metrics/counter', function(req, res) {
	res.set('Content-Type', register.contentType);
	res.end(register.getSingleMetricAsString('test_counter'));
});

console.log('Server listening to 3000, metrics exposed on /metrics endpoint'); //eslint-disable-line no-console
server.listen(3000);

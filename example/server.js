'use strict';

var express = require('express');
var server = express();
var register = require('../lib/register');

var Histogram = require('../lib/histogram');
var h = new Histogram('test_histogram', 'Example of a histogram', [ 'code' ]);

var Counter = require('../lib/counter');
var c = new Counter('test_counter', 'Example of a counter', [ 'code' ]);

var Gauge = require('../lib/gauge');
var g = new Gauge('test_gauge', 'Example of a gauge', [ 'method', 'code' ]);

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
	res.end(register.metrics());
});

server.listen(3000);

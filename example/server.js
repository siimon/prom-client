'use strict';

var express = require('express');
var server = express();
var register = require('../lib/register');

var Histogram = require('../lib/histogram');
var h = new Histogram('test_histogram', 'Example of a histogram');

var Counter = require('../lib/counter');
var c = new Counter('test_counter', 'Example of a counter', { labels: { 'code': 200 }});

var Gauge = require('../lib/gauge');
var g = new Gauge('test_gauge', 'Example of a gauge');

setInterval(function() {
	h.observe(Math.random());
}, 100);

setInterval(function() {
	c.inc();
}, 5000);

setInterval(function() {
	g.set(Math.random());
}, 100);

server.get('/metrics', function(req, res) {
	res.end(register.metrics());
});

server.listen(3000);

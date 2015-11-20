'use strict';

var express = require('express');
var server = express();
var register = require('../lib/register');

var Histogram = require('../lib/histogram');
var h = new Histogram({ name: 'test_histogram', help: 'Example of a histogram' });

var Counter = require('../lib/counter');
var c = new Counter({ name: 'test_counter', help: 'Example of a counter', labels: { 'code': 200 }});

var Gauge = require('../lib/gauge');
var g = new Gauge({ name: 'test_gauge', help: 'Example of a gauge'});

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

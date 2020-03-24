'use strict';

// Histogram
// Multiple Labels
// Multiple Values per Label

const register = require('..').register;

const Histogram = require('..').Histogram;
const h = new Histogram({
	name: 'test_histogram',
	help: 'Example of a histogram',
	labelNames: ['code', 'color']
});

h.labels('200', 'blue').observe(0.4);
h.labels('300', 'red').observe(0.6);
h.labels('300', 'blue').observe(0.4);
h.labels('200', 'red').observe(0.6);

console.log(register.metrics());

/*
Output from metrics():

# HELP test_histogram Example of a histogram
# TYPE test_histogram histogram
test_histogram_bucket{le="0.005",code="200",color="blue"} 0
test_histogram_bucket{le="0.01",code="200",color="blue"} 0
test_histogram_bucket{le="0.025",code="200",color="blue"} 0
test_histogram_bucket{le="0.05",code="200",color="blue"} 0
test_histogram_bucket{le="0.1",code="200",color="blue"} 0
test_histogram_bucket{le="0.25",code="200",color="blue"} 0
test_histogram_bucket{le="0.5",code="200",color="blue"} 1
test_histogram_bucket{le="1",code="200",color="blue"} 1
test_histogram_bucket{le="2.5",code="200",color="blue"} 1
test_histogram_bucket{le="5",code="200",color="blue"} 1
test_histogram_bucket{le="10",code="200",color="blue"} 1
test_histogram_bucket{le="+Inf",code="200",color="blue"} 1
test_histogram_sum{code="200",color="blue"} 0.4
test_histogram_count{code="200",color="blue"} 1
test_histogram_bucket{le="0.005",code="300",color="red"} 0
test_histogram_bucket{le="0.01",code="300",color="red"} 0
test_histogram_bucket{le="0.025",code="300",color="red"} 0
test_histogram_bucket{le="0.05",code="300",color="red"} 0
test_histogram_bucket{le="0.1",code="300",color="red"} 0
test_histogram_bucket{le="0.25",code="300",color="red"} 0
test_histogram_bucket{le="0.5",code="300",color="red"} 0
test_histogram_bucket{le="1",code="300",color="red"} 1
test_histogram_bucket{le="2.5",code="300",color="red"} 1
test_histogram_bucket{le="5",code="300",color="red"} 1
test_histogram_bucket{le="10",code="300",color="red"} 1
test_histogram_bucket{le="+Inf",code="300",color="red"} 1
test_histogram_sum{code="300",color="red"} 0.6
test_histogram_count{code="300",color="red"} 1
test_histogram_bucket{le="0.005",code="300",color="blue"} 0
test_histogram_bucket{le="0.01",code="300",color="blue"} 0
test_histogram_bucket{le="0.025",code="300",color="blue"} 0
test_histogram_bucket{le="0.05",code="300",color="blue"} 0
test_histogram_bucket{le="0.1",code="300",color="blue"} 0
test_histogram_bucket{le="0.25",code="300",color="blue"} 0
test_histogram_bucket{le="0.5",code="300",color="blue"} 1
test_histogram_bucket{le="1",code="300",color="blue"} 1
test_histogram_bucket{le="2.5",code="300",color="blue"} 1
test_histogram_bucket{le="5",code="300",color="blue"} 1
test_histogram_bucket{le="10",code="300",color="blue"} 1
test_histogram_bucket{le="+Inf",code="300",color="blue"} 1
test_histogram_sum{code="300",color="blue"} 0.4
test_histogram_count{code="300",color="blue"} 1
test_histogram_bucket{le="0.005",code="200",color="red"} 0
test_histogram_bucket{le="0.01",code="200",color="red"} 0
test_histogram_bucket{le="0.025",code="200",color="red"} 0
test_histogram_bucket{le="0.05",code="200",color="red"} 0
test_histogram_bucket{le="0.1",code="200",color="red"} 0
test_histogram_bucket{le="0.25",code="200",color="red"} 0
test_histogram_bucket{le="0.5",code="200",color="red"} 0
test_histogram_bucket{le="1",code="200",color="red"} 1
test_histogram_bucket{le="2.5",code="200",color="red"} 1
test_histogram_bucket{le="5",code="200",color="red"} 1
test_histogram_bucket{le="10",code="200",color="red"} 1
test_histogram_bucket{le="+Inf",code="200",color="red"} 1
test_histogram_sum{code="200",color="red"} 0.6
test_histogram_count{code="200",color="red"} 1

*/

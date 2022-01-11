'use strict';

// Histogram
// Single Label
// Single Value

const { register, Histogram } = require('..');

const h = new Histogram({
	name: 'test_histogram',
	help: 'Example of a histogram',
	labelNames: ['code'],
});

h.labels('200').observe(0.4);
h.labels('200').observe(0.6);

h.observe({ code: '200' }, 0.4);

register.metrics().then(str => console.log(str));

/*
Output from metrics():

# HELP test_histogram Example of a histogram
# TYPE test_histogram histogram
test_histogram_bucket{le="0.005",code="200"} 0
test_histogram_bucket{le="0.01",code="200"} 0
test_histogram_bucket{le="0.025",code="200"} 0
test_histogram_bucket{le="0.05",code="200"} 0
test_histogram_bucket{le="0.1",code="200"} 0
test_histogram_bucket{le="0.25",code="200"} 0
test_histogram_bucket{le="0.5",code="200"} 2
test_histogram_bucket{le="1",code="200"} 3
test_histogram_bucket{le="2.5",code="200"} 3
test_histogram_bucket{le="5",code="200"} 3
test_histogram_bucket{le="10",code="200"} 3
test_histogram_bucket{le="+Inf",code="200"} 3
test_histogram_sum{code="200"} 1.4
test_histogram_count{code="200"} 3

*/

# Prometheus client for node.js [![Build Status](https://travis-ci.org/siimon/prom-client.svg?branch=master)](https://travis-ci.org/siimon/prom-client)

A prometheus client for node.js that supports histogram, gauges and counters.

### Usage

See example folder for a sample usage. The library does not bundle any web framework, to expose the metrics just return the metrics() function in the registry.

### API

#### Configuration

All metric types has 2 mandatory parameters, name and help. 

#### Counter

Counters go up, and reset when the process restarts.

```
var Client = require('prom-client');
var counter = new Client.counter('metric_name', 'metric_help');
counter.inc(); // Inc with 1
counter.inc(10); // Inc with 10
```

#### Gauge

Gauges are similar to Counters but Gauges value can be decreased.

```
var Client = require('prom-client');
var gauge = new Client.gauge('metric_name', 'metric_help');
gauge.set(10); // Set to 10
gauge.inc(); // Inc with 1
gauge.inc(10); // Inc with 10
gauge.dec(); // Dec with 1
gauge.dec(10); // Dec with 10
```

There are some utilities for common use cases:

```
gauge.setToCurrentTime(); // Sets value to current time

var end = gauge.startTimer();
xhrRequest(function(err, res) {
	end(); // Sets value to xhrRequests duration in seconds
});
```

#### Histogram

Histograms track sizes and frequency of events.  

**Configuration**  

The defaults buckets are intended to cover usual web/rpc requests, this can however be overriden.
```
var Client = require('prom-client');
new Client.histogram('metric_name', 'metric_help', { 
	buckets: [ 0.10, 5, 15, 50, 100, 500 ]
});
```

Examples

```
var Client = require('prom-client');
var histogram = new Client.histogram('metric_name', 'metric_help');
histogram.observe(10); // Observe value in histogram
```

Utility to observe request durations
```
var end = histogram.startTimer();
xhrRequest(function(err, res) {
	end(); // Observes the value to xhrRequests duration in seconds
});
```

#### Labels 

All metrics take an array as 3rd parameter that should include all supported label keys. There are 2 ways to add values to the labels
```
var Client = require('prom-client');
var gauge = new Client.gauge('metric_name', 'metric_help', [ 'method', 'statusCode' ]);

gauge.set({ method: 'GET', statusCode: '200' }, 100); // 1st version, Set value 100 with method set to GET and statusCode to 200
gauge.labels('GET', '200').set(100); // 2nd version, Same as above
```

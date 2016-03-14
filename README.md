# Prometheus client for node.js [![Build Status](https://travis-ci.org/siimon/prom-client.svg?branch=master)](https://travis-ci.org/siimon/prom-client)

A prometheus client for node.js that supports histogram, summaries, gauges and counters.

### Usage

See example folder for a sample usage. The library does not bundle any web framework, to expose the metrics just return the metrics() function in the registry.

### API

#### Configuration

All metric types has 2 mandatory parameters, name and help.

#### Counter

Counters go up, and reset when the process restarts.

```
var client = require('prom-client');
var counter = new client.Counter('metric_name', 'metric_help');
counter.inc(); // Inc with 1
counter.inc(10); // Inc with 10
```

#### Gauge

Gauges are similar to Counters but Gauges value can be decreased.

```
var client = require('prom-client');
var gauge = new client.Gauge('metric_name', 'metric_help');
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
var client = require('prom-client');
new client.Histogram('metric_name', 'metric_help', {
	buckets: [ 0.10, 5, 15, 50, 100, 500 ]
});
```

Examples

```
var client = require('prom-client');
var histogram = new client.Histogram('metric_name', 'metric_help');
histogram.observe(10); // Observe value in histogram
```

Utility to observe request durations
```
var end = histogram.startTimer();
xhrRequest(function(err, res) {
	end(); // Observes the value to xhrRequests duration in seconds
});
```

#### Summary

Summaries calculate percentiles of observed values.

**Configuration**

The default percentiles are: 0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999. But they can be overriden like this:

```
var client = require('prom-client');
new client.Summary('metric_name', 'metric_help', {
	percentiles: [ 0.01, 0.1, 0.9, 0.99 ]
});
```

Usage example

```
var client = require('prom-client');
var summary = new client.Summary('metric_name', 'metric_help');
summary.observe(10);
```

Utility to observe request durations
```
var end = summary.startTimer();
xhrRequest(function(err, res) {
	end(); // Observes the value to xhrRequests duration in seconds
});
```

#### Labels

All metrics take an array as 3rd parameter that should include all supported label keys. There are 2 ways to add values to the labels
```
var client = require('prom-client');
var gauge = new client.Gauge('metric_name', 'metric_help', [ 'method', 'statusCode' ]);

gauge.set({ method: 'GET', statusCode: '200' }, 100); // 1st version, Set value 100 with method set to GET and statusCode to 200
gauge.labels('GET', '200').set(100); // 2nd version, Same as above
```

#### Pushgateway

It is possible to push metrics via a [Pushgateway](https://github.com/prometheus/pushgateway). 

```
var client = require('prom-client');
var gateway = new client.Pushgateway('127.0.0.1:9091');

gateway.pushAdd({ jobName: 'test' }, function(err, resp, body) { }); //Add metric and overwrite old ones
gateway.push({ jobName: 'test' }, function(err, resp, body) { }); //Overwrite all metrics (use PUT)
gateway.delete({ jobName: 'test' }, function(err, resp, body) { }); //Delete all metrics for jobName

//All gateway requests can have groupings on it
gateway.pushAdd({ jobName: 'test', groupings: { key: 'value' } }, function(err, resp, body) { });
```


#### Utilites

For convenience, there are 2 bucket generator functions - linear and exponential. 

```
var client = require('prom-client');
new client.Histogram('metric_name', 'metric_help', {
	buckets: client.linearBuckets(0, 10, 20) //Create 20 buckets, starting on 0 and a width of 10
});

new client.Histogram('metric_name', 'metric_help', {
	buckets: client.exponentialBuckets(1, 2, 5) //Create 5 buckets, starting on 1 and with a factor of 2
});
```

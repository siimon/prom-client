# Prometheus client for node.js [![Build Status](https://travis-ci.org/siimon/prom-client.svg?branch=master)](https://travis-ci.org/siimon/prom-client) [![Build status](https://ci.appveyor.com/api/projects/status/k2e0gwonkcee3lp9/branch/master?svg=true)](https://ci.appveyor.com/project/siimon/prom-client/branch/master)

A prometheus client for node.js that supports histogram, summaries, gauges and counters.

### Usage

See example folder for a sample usage. The library does not bundle any web framework, to expose the metrics just return the metrics() function in the registry.

### API

#### Configuration

All metric types has 2 mandatory parameters, name and help.

#### Default metrics

There are some default metrics recommended by Prometheus
[itself](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors). These metrics are collected
automatically for you when you do `require('prom-client')`.

NOTE: Some of the metrics, concerning File Descriptors and Memory, are only available on Linux.

In addition, some Node-specific metrics are included, such as event loop lag, and active handles. See what metrics there are in
[lib/metrics](lib/metrics).

The function returned from `defaultMetrics` takes 2 options, a blacklist of metrics to skip, and a timeout for how often the probe should
be fired. By default all probes are launched every 10 seconds, but this can be modified like this:

```js
var client = require('prom-client');

var defaultMetrics = client.defaultMetrics;

// Skip `osMemoryHeap` probe, and probe every 5th second.
defaultMetrics(['osMemoryHeap'], 5000);
````

You can get the full list of metrics by inspecting `client.defaultMetrics.metricsList`.

`defaultMetrics` returns an identification when invoked, which is a reference to the `Timer` used to keep the probes going. This can be
passed to `clearInterval` in order to stop all probes.

NOTE: Existing intervals are automatically cleared when calling `defaultMetrics`.

```js
var client = require('prom-client');

var defaultMetrics = client.defaultMetrics;

var interval = defaultMetrics();

// ... some time later

clearInterval(interval);
````

NOTE: `unref` is called on the `interval` internally, so it will not keep your node process going indefinitely if it's the only thing
keeping it from shutting down.

##### Disabling default metrics

To disable collecting the default metrics, you have to call the function and pass it to `clearInterval`.

```js
var client = require('prom-client');

clearInterval(client.defaultMetrics());

// Clear the register
client.register.clear();
```

#### Counter

Counters go up, and reset when the process restarts.

```js
var client = require('prom-client');
var counter = new client.Counter('metric_name', 'metric_help');
counter.inc(); // Inc with 1
counter.inc(10); // Inc with 10
```

#### Gauge

Gauges are similar to Counters but Gauges value can be decreased.

```js
var client = require('prom-client');
var gauge = new client.Gauge('metric_name', 'metric_help');
gauge.set(10); // Set to 10
gauge.inc(); // Inc with 1
gauge.inc(10); // Inc with 10
gauge.dec(); // Dec with 1
gauge.dec(10); // Dec with 10
```

There are some utilities for common use cases:

```js
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
```js
var client = require('prom-client');
new client.Histogram('metric_name', 'metric_help', {
	buckets: [ 0.10, 5, 15, 50, 100, 500 ]
});
```

Examples

```js
var client = require('prom-client');
var histogram = new client.Histogram('metric_name', 'metric_help');
histogram.observe(10); // Observe value in histogram
```

Utility to observe request durations
```js
var end = histogram.startTimer();
xhrRequest(function(err, res) {
	end(); // Observes the value to xhrRequests duration in seconds
});
```

#### Summary

Summaries calculate percentiles of observed values.

**Configuration**

The default percentiles are: 0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999. But they can be overriden like this:

```js
var client = require('prom-client');
new client.Summary('metric_name', 'metric_help', {
	percentiles: [ 0.01, 0.1, 0.9, 0.99 ]
});
```

Usage example

```js
var client = require('prom-client');
var summary = new client.Summary('metric_name', 'metric_help');
summary.observe(10);
```

Utility to observe request durations
```js
var end = summary.startTimer();
xhrRequest(function(err, res) {
	end(); // Observes the value to xhrRequests duration in seconds
});
```

#### Labels

All metrics take an array as 3rd parameter that should include all supported label keys. There are 2 ways to add values to the labels
```js
var client = require('prom-client');
var gauge = new client.Gauge('metric_name', 'metric_help', [ 'method', 'statusCode' ]);

gauge.set({ method: 'GET', statusCode: '200' }, 100); // 1st version, Set value 100 with method set to GET and statusCode to 200
gauge.labels('GET', '200').set(100); // 2nd version, Same as above
```

It is also possible to use timers with labels, both before and after the timer is created:
```js
var end = startTimer({ method: 'GET' }); // Set method to GET, we don't know statusCode yet
xhrRequest(function(err, res) {
	if (err) {
		end({ statusCode: '500' }); // Sets value to xhrRequest duration in seconds with statusCode 500
	} else {
		end({ statusCode: '200' }); // Sets value to xhrRequest duration in seconds with statusCode 200
	}
});
```

#### Register

You can get all metrics by running `register.metrics()`, which will output a string for prometheus to consume.

##### Getting a single metric

If you need to get a reference to a previously registered metric, you can use `register.getSingleMetric(*name of metric*)`.

##### Removing metrics

You can remove all metrics by calling `register.clear()`. You can also remove a single metric by calling
`register.removeSingleMetric(*name of metric*)`.

#### Pushgateway

It is possible to push metrics via a [Pushgateway](https://github.com/prometheus/pushgateway). 

```js
var client = require('prom-client');
var gateway = new client.Pushgateway('http://127.0.0.1:9091');

gateway.pushAdd({ jobName: 'test' }, function(err, resp, body) { }); //Add metric and overwrite old ones
gateway.push({ jobName: 'test' }, function(err, resp, body) { }); //Overwrite all metrics (use PUT)
gateway.delete({ jobName: 'test' }, function(err, resp, body) { }); //Delete all metrics for jobName

//All gateway requests can have groupings on it
gateway.pushAdd({ jobName: 'test', groupings: { key: 'value' } }, function(err, resp, body) { });
```


#### Utilites

For convenience, there are 2 bucket generator functions - linear and exponential. 

```js
var client = require('prom-client');
new client.Histogram('metric_name', 'metric_help', {
	buckets: client.linearBuckets(0, 10, 20) //Create 20 buckets, starting on 0 and a width of 10
});

new client.Histogram('metric_name', 'metric_help', {
	buckets: client.exponentialBuckets(1, 2, 5) //Create 5 buckets, starting on 1 and with a factor of 2
});
```

### Garbage Collection

To avoid dependencies in this module, GC stats are kept outside of it. If you want GC stats, you can use https://github.com/SimenB/node-prometheus-gc-stats

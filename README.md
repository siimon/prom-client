# Prometheus client for node.js [![Build Status](https://travis-ci.org/siimon/prom-client.svg?branch=master)](https://travis-ci.org/siimon/prom-client) [![Build status](https://ci.appveyor.com/api/projects/status/k2e0gwonkcee3lp9/branch/master?svg=true)](https://ci.appveyor.com/project/siimon/prom-client/branch/master) [![Actions Status](https://github.com/siimon/prom-client/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/siimon/prom-client/actions)

A prometheus client for Node.js that supports histogram, summaries, gauges and
counters.

## Usage

See example folder for a sample usage. The library does not bundle any web
framework. To expose the metrics, respond to Prometheus's scrape requests with
the result of `await registry.metrics()`.

### Usage with Node.js's `cluster` module

Node.js's `cluster` module spawns multiple processes and hands off socket
connections to those workers. Returning metrics from a worker's local registry
will only reveal that individual worker's metrics, which is generally
undesirable. To solve this, you can aggregate all of the workers' metrics in the
master process. See `example/cluster.js` for an example.

Default metrics use sensible aggregation methods. Custom metrics are summed
across workers by default. To use a different aggregation method, set the
`aggregator` property in the metric config to one of 'sum', 'first', 'min',
'max', 'average' or 'omit'. (See `lib/metrics/version.js` for an example.)

If you need to expose metrics about an individual worker, you can include a
value that is unique to the worker (such as the worker ID or process ID) in a
label. (See `example/server.js` for an example using
`worker_${cluster.worker.id}` as a label value.)

Metrics are aggregated from the global registry by default. To use a different
registry, call
`client.AggregatorRegistry.setRegistries(registryOrArrayOfRegistries)` from the
worker processes.

## API

### Default metrics

There are some default metrics recommended by Prometheus
[itself](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors).
To collect these, call `collectDefaultMetrics`. In addition, some
Node.js-specific metrics are included, such as event loop lag, active handles,
GC and Node.js version. See [lib/metrics](lib/metrics) for a list of all
metrics.

NOTE: Some of the metrics, concerning File Descriptors and Memory, are only
available on Linux.

`collectDefaultMetrics` optionally accepts a config object with following entries:

- `prefix` an optional prefix for metric names. Default: no prefix.
- `registry` to which metrics should be registered. Default: the global default registry.
- `gcDurationBuckets` with custom buckets for GC duration histogram. Default buckets of GC duration histogram are `[0.001, 0.01, 0.1, 1, 2, 5]` (in seconds).
- `eventLoopMonitoringPrecision` with sampling rate in milliseconds. Must be greater than zero. Default: 10.

To register metrics to another registry, pass it in as `register`:

```js
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
collectDefaultMetrics({ register });
```

To use custom buckets for GC duration histogram, pass it in as `gcDurationBuckets`:

```js
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ gcDurationBuckets: [0.1, 0.2, 0.3] });
```

To prefix metric names with your own arbitrary string, pass in a `prefix`:

```js
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const prefix = 'my_application_';
collectDefaultMetrics({ prefix });
```

You can get the full list of metrics by inspecting
`client.collectDefaultMetrics.metricsList`.

Default metrics are collected on scrape of metrics endpoint,
not on an interval.

```js
const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();
```

### Custom Metrics

All metric types have two mandatory parameters: `name` and `help`. Refer to
<https://prometheus.io/docs/practices/naming/> for guidance on naming metrics.

For metrics based on point-in-time observations (e.g. current memory usage, as
opposed to HTTP request durations observed continuously in a histogram), you
should provide a `collect()` function, which will be invoked when Prometheus
scrapes your metrics endpoint. `collect()` can either be synchronous or return a
promise. See **Gauge** below for an example. (Note that you should not update
metric values in a `setInterval` callback; do so in this `collect` function
instead.)

See [**Labels**](#labels) for information on how to configure labels for all
metric types.

#### Counter

Counters go up, and reset when the process restarts.

```js
const client = require('prom-client');
const counter = new client.Counter({
  name: 'metric_name',
  help: 'metric_help',
});
counter.inc(); // Increment by 1
counter.inc(10); // Increment by 10
```

#### Gauge

Gauges are similar to Counters but a Gauge's value can be decreased.

```js
const client = require('prom-client');
const gauge = new client.Gauge({ name: 'metric_name', help: 'metric_help' });
gauge.set(10); // Set to 10
gauge.inc(); // Increment 1
gauge.inc(10); // Increment 10
gauge.dec(); // Decrement by 1
gauge.dec(10); // Decrement by 10
```

##### Configuration

If the gauge is used for a point-in-time observation, you should provide a
`collect` function:

```js
const client = require('prom-client');
new client.Gauge({
  name: 'metric_name',
  help: 'metric_help',
  collect() {
    // Invoked when the registry collects its metrics' values.
    // This can be synchronous or it can return a promise/be an async function.
    this.set(/* the current value */);
  },
});
```

```js
// Async version:
const client = require('prom-client');
new client.Gauge({
  name: 'metric_name',
  help: 'metric_help',
  async collect() {
    // Invoked when the registry collects its metrics' values.
    const currentValue = await somethingAsync();
    this.set(currentValue);
  },
});
```

Note that you should not use arrow functions for `collect` because arrow
functions will not have the correct value for `this`.

##### Utility Functions

```js
// Set value to current time:
gauge.setToCurrentTime();

// Record durations:
const end = gauge.startTimer();
http.get('url', res => {
  end();
});
```

#### Histogram

Histograms track sizes and frequency of events.

##### Configuration

The defaults buckets are intended to cover usual web/RPC requests, but they can
be overridden. (See also [**Bucket Generators**](#bucket-generators).)

```js
const client = require('prom-client');
new client.Histogram({
  name: 'metric_name',
  help: 'metric_help',
  buckets: [0.1, 5, 15, 50, 100, 500],
});
```

##### Examples

```js
const client = require('prom-client');
const histogram = new client.Histogram({
  name: 'metric_name',
  help: 'metric_help',
});
histogram.observe(10); // Observe value in histogram
```

##### Utility Methods

```js
const end = histogram.startTimer();
xhrRequest(function (err, res) {
  const seconds = end(); // Observes and returns the value to xhrRequests duration in seconds
});
```

#### Summary

Summaries calculate percentiles of observed values.

##### Configuration

The default percentiles are: 0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999. But they
can be overridden by specifying a `percentiles` array. (See also
[**Bucket Generators**](#bucket-generators).)

```js
const client = require('prom-client');
new client.Summary({
  name: 'metric_name',
  help: 'metric_help',
  percentiles: [0.01, 0.1, 0.9, 0.99],
});
```

To enable the sliding window functionality for summaries you need to add
`maxAgeSeconds` and `ageBuckets` to the config like this:

```js
const client = require('prom-client');
new client.Summary({
  name: 'metric_name',
  help: 'metric_help',
  maxAgeSeconds: 600,
  ageBuckets: 5,
});
```

The `maxAgeSeconds` will tell how old a bucket can be before it is reset and
`ageBuckets` configures how many buckets we will have in our sliding window for
the summary.

##### Examples

```js
const client = require('prom-client');
const summary = new client.Summary({
  name: 'metric_name',
  help: 'metric_help',
});
summary.observe(10);
```

##### Utility Methods

```js
const end = summary.startTimer();
xhrRequest(function (err, res) {
  end(); // Observes the value to xhrRequests duration in seconds
});
```

### Labels

All metrics can take a `labelNames` property in the configuration object. All
label names that the metric support needs to be declared here. There are two
ways to add values to the labels:

```js
const client = require('prom-client');
const gauge = new client.Gauge({
  name: 'metric_name',
  help: 'metric_help',
  labelNames: ['method', 'statusCode'],
});

// 1st version: Set value to 100 with "method" set to "GET" and "statusCode" to "200"
gauge.set({ method: 'GET', statusCode: '200' }, 100);
// 2nd version: Same effect as above
gauge.labels('GET', '200').set(100);
```

It is also possible to use timers with labels, both before and after the timer
is created:

```js
const end = startTimer({ method: 'GET' }); // Set method to GET, we don't know statusCode yet
xhrRequest(function (err, res) {
  if (err) {
    end({ statusCode: '500' }); // Sets value to xhrRequest duration in seconds with statusCode 500
  } else {
    end({ statusCode: '200' }); // Sets value to xhrRequest duration in seconds with statusCode 200
  }
});
```

#### Default Labels (segmented by registry)

Static labels may be applied to every metric emitted by a registry:

```js
const client = require('prom-client');
const defaultLabels = { serviceName: 'api-v1' };
client.register.setDefaultLabels(defaultLabels);
```

This will output metrics in the following way:

```
# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes{serviceName="api-v1"} 33853440 1498510040309
```

Default labels will be overridden if there is a name conflict.

`register.clear()` will clear default labels.

### Multiple registries

By default, metrics are automatically registered to the global registry (located
at `require('prom-client').register`). You can prevent this by specifying
`registers: []` in the metric constructor configuration.

Using non-global registries requires creating a Registry instance and passing it
inside `registers` in the metric configuration object. Alternatively you can
pass an empty `registers` array and register it manually.

Registry has a `merge` function that enables you to expose multiple registries
on the same endpoint. If the same metric name exists in both registries, an
error will be thrown.

```js
const client = require('prom-client');
const registry = new client.Registry();
const counter = new client.Counter({
  name: 'metric_name',
  help: 'metric_help',
  registers: [registry], // specify a non-default registry
});
const histogram = new client.Histogram({
  name: 'metric_name',
  help: 'metric_help',
  registers: [], // don't automatically register this metric
});
registry.registerMetric(histogram); // register metric manually
counter.inc();

const mergedRegistries = client.Registry.merge([registry, client.register]);
```

If you want to use multiple or non-default registries with the Node.js `cluster`
module, you will need to set the registry/registries to aggregate from:

```js
const AggregatorRegistry = client.AggregatorRegistry;
AggregatorRegistry.setRegistries(registry);
// or for multiple registries:
AggregatorRegistry.setRegistries([registry1, registry2]);
```

### Register

You can get all metrics by running `await register.metrics()`, which will return
a string in the Prometheus exposition format.

#### Getting a single metric value in Prometheus exposition format

If you need to output a single metric in the Prometheus exposition format, you
can use `await register.getSingleMetricAsString(*name of metric*)`, which will
return a string for Prometheus to consume.

#### Getting a single metric

If you need to get a reference to a previously registered metric, you can use
`await register.getSingleMetric(*name of metric*)`.

#### Removing metrics

You can remove all metrics by calling `register.clear()`. You can also remove a
single metric by calling `register.removeSingleMetric(*name of metric*)`.

#### Resetting metrics

If you need to reset all metrics, you can use `register.resetMetrics()`. The
metrics will remain present in the register and can be used without the need to
instantiate them again, like you would need to do after `register.clear()`.

#### Cluster metrics

You can get aggregated metrics for all workers in a Node.js cluster with
`await register.clusterMetrics()`. This method returns a promise that resolves
with a metrics string suitable for Prometheus to consume.

```js
const metrics = await register.clusterMetrics();

// - or -

register
  .clusterMetrics()
  .then(metrics => {
    /* ... */
  })
  .catch(err => {
    /* ... */
  });
```

### Pushgateway

It is possible to push metrics via a
[Pushgateway](https://github.com/prometheus/pushgateway).

```js
const client = require('prom-client');
let gateway = new client.Pushgateway('http://127.0.0.1:9091');

gateway.pushAdd({ jobName: 'test' }, function (err, resp, body) {}); //Add metric and overwrite old ones
gateway.push({ jobName: 'test' }, function (err, resp, body) {}); //Overwrite all metrics (use PUT)
gateway.delete({ jobName: 'test' }, function (err, resp, body) {}); //Delete all metrics for jobName

//All gateway requests can have groupings on it
gateway.pushAdd({ jobName: 'test', groupings: { key: 'value' } }, function (
  err,
  resp,
  body,
) {});

//It's possible to extend the Pushgateway with request options from nodes core http/https library
gateway = new client.Pushgateway('http://127.0.0.1:9091', { timeout: 5000 }); //Set the request timeout to 5000ms
```

### Bucket Generators

For convenience, there are two bucket generator functions - linear and
exponential.

```js
const client = require('prom-client');
new client.Histogram({
  name: 'metric_name',
  help: 'metric_help',
  buckets: client.linearBuckets(0, 10, 20), //Create 20 buckets, starting on 0 and a width of 10
});

new client.Histogram({
  name: 'metric_name',
  help: 'metric_help',
  buckets: client.exponentialBuckets(1, 2, 5), //Create 5 buckets, starting on 1 and with a factor of 2
});
```

The content-type prometheus expects is also exported as a constant, both on the
`register` and from the main file of this project, called `contentType`.

### Garbage Collection Metrics

To avoid native dependencies in this module, GC statistics for bytes reclaimed
in each GC sweep are kept in a separate module:
https://github.com/SimenB/node-prometheus-gc-stats. (Note that that metric may
no longer be accurate now that v8 uses parallel garbage collection.)

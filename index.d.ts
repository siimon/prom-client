// Type definitions for prom-client
// Definitions by: Simon Nyberg http://twitter.com/siimon_nyberg

/**
 * Options pass to Registry.metrics()
 */
export interface MetricsOpts {
	/**
	 * Whether to include timestamps in the output, defaults to true
	 */
	timestamps?: boolean;
}

/**
 * Container for all registered metrics
 */
export class Registry {
	/**
	 * Get string representation for all metrics
	 */
	metrics(opts?: MetricsOpts): string;

	/**
	 * Remove all metrics from the registry
	 */
	clear(): void;

	/**
	 * Reset all metrics in the registry
	 */
	resetMetrics(): void;

	/**
	 * Register metric to register
	 * @param metric Metric to add to register
	 */
	registerMetric(metric: Metric): void;

	/**
	 * Get all metrics as objects
	 */
	getMetricsAsJSON(): metric[];

	/**
	 * Remove a single metric
	 * @param name The name of the metric to remove
	 */
	removeSingleMetric(name: string): void;

	/**
	 * Get a single metric
	 * @param name The name of the metric
	 */
	getSingleMetric(name: string): Metric;

	/**
	 * Set static labels to every metric emitted by this registry
	 * @param labels of name/value pairs:
	 * { defaultLabel: "value", anotherLabel: "value 2" }
	 */
	setDefaultLabels(labels: Object): void;

	/**
	 * Get a string representation of a single metric by name
	 * @param name The name of the metric
	 */
	getSingleMetricAsString(name: string): string;

	/**
	 * Gets the Content-Type of the metrics for use in the response headers.
	 */
	contentType: string;

	/**
	 * Merge registers
	 * @param registers The registers you want to merge together
	 */
	static merge(registers: Registry[]): Registry;
}

/**
 * The register that contains all metrics
 */
export const register: Registry;

export class AggregatorRegistry extends Registry {
	/**
	 * Gets aggregated metrics for all workers. The optional callback and
	 * returned Promise resolve with the same value; either may be used.
	 * @param {Function?} cb (err, metrics) => any
	 * @return {Promise<string>} Promise that resolves with the aggregated
	 *   metrics.
	 */
	clusterMetrics(
		cb?: (err: Error | null, metrics?: string) => any
	): Promise<string>;

	/**
	 * Creates a new Registry instance from an array of metrics that were
	 * created by `registry.getMetricsAsJSON()`. Metrics are aggregated using
	 * the method specified by their `aggregator` property, or by summation if
	 * `aggregator` is undefined.
	 * @param {Array} metricsArr Array of metrics, each of which created by
	 *   `registry.getMetricsAsJSON()`.
	 * @return {Registry} aggregated registry.
	 */
	static aggregate(metricsArr: Array<Object>): Registry;

	/**
	 * Sets the registry or registries to be aggregated. Call from workers to
	 * use a registry/registries other than the default global registry.
	 * @param {Array<Registry>|Registry} regs Registry or registries to be
	 *   aggregated.
	 * @return {void}
	 */
	static setRegistries(regs: Array<Registry> | Registry): void;
}

/**
 * General metric type
 */
export type Metric = Counter | Gauge | Summary | Histogram;

/**
 * Aggregation methods, used for aggregating metrics in a Node.js cluster.
 */
export type Aggregator = 'omit' | 'sum' | 'first' | 'min' | 'max' | 'average';

export enum MetricType {
	Counter,
	Gauge,
	Histogram,
	Summary
}

interface metric {
	name: string;
	help: string;
	type: MetricType;
	aggregator: Aggregator;
}

interface labelValues {
	[key: string]: string | number;
}

export interface CounterConfiguration {
	name: string;
	help: string;
	labelNames?: string[];
	registers?: Registry[];
	aggregator?: Aggregator;
}

/**
 * A counter is a cumulative metric that represents a single numerical value that only ever goes up
 */
export class Counter {
	/**
	 * @param configuration Configuration when creating a Counter metric. Name and Help is required.
	 */
	constructor(configuration: CounterConfiguration);

	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param labels Label keys
	 * @deprecated
	 */
	constructor(name: string, help: string, labels?: string[]);

	/**
	 * Increment for given labels
	 * @param labels Object with label keys and values
	 * @param value The number to increment with
	 * @param timestamp Timestamp to associate the time series with
	 */
	inc(labels: labelValues, value?: number, timestamp?: number | Date): void;

	/**
	 * Increment with value
	 * @param value The value to increment with
	 * @param timestamp Timestamp to associate the time series with
	 */
	inc(value?: number, timestamp?: number | Date): void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured counter with given labels
	 */
	labels(...values: string[]): Counter.Internal;

	/**
	 * Reset counter values
	 */
	reset(): void;
}

export namespace Counter {
	interface Internal {
		/**
		 * Increment with value
		 * @param value The value to increment with
		 * @param timestamp Timestamp to associate the time series with
		 */
		inc(value?: number, timestamp?: number | Date): void;
	}
}

export interface GaugeConfiguration {
	name: string;
	help: string;
	labelNames?: string[];
	registers?: Registry[];
	aggregator?: Aggregator;
}

/**
 * A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.
 */
export class Gauge {
	/**
	 * @param configuration Configuration when creating a Gauge metric. Name and Help is mandatory
	 */
	constructor(configuration: GaugeConfiguration);

	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param labels Label keys
	 * @deprecated
	 */
	constructor(name: string, help: string, labels?: string[]);

	/**
	 * Increment gauge for given labels
	 * @param labels Object with label keys and values
	 * @param value The value to increment with
	 * @param timestamp Timestamp to associate the time series with
	 */
	inc(labels: labelValues, value?: number, timestamp?: number | Date): void;

	/**
	 * Increment gauge
	 * @param value The value to increment with
	 * @param timestamp Timestamp to associate the time series with
	 */
	inc(value?: number, timestamp?: number | Date): void;

	/**
	 * Decrement gauge
	 * @param labels Object with label keys and values
	 * @param value Value to decrement with
	 * @param timestamp Timestamp to associate the time series with
	 */
	dec(labels: labelValues, value?: number, timestamp?: number | Date): void;

	/**
	 * Decrement gauge
	 * @param value The value to decrement with
	 * @param timestamp Timestamp to associate the time series with
	 */
	dec(value?: number, timestamp?: number | Date): void;

	/**
	 * Set gauge value for labels
	 * @param labels Object with label keys and values
	 * @param value The value to set
	 * @param timestamp Timestamp to associate the time series with
	 */
	set(labels: labelValues, value: number, timestamp?: number | Date): void;

	/**
	 * Set gauge value
	 * @param value The value to set
	 * @param timestamp Timestamp to associate the time series with
	 */
	set(value: number, timestamp?: number | Date): void;

	/**
	 * Set gauge value to current epoch time in ms
	 * @param labels Object with label keys and values
	 */
	setToCurrentTime(labels?: labelValues): void;

	/**
	 * Start a timer where the gauges value will be the duration in seconds
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: labelValues): (labels?: labelValues) => void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured gauge with given labels
	 */
	labels(...values: string[]): Gauge.Internal;

	/**
	 * Reset gauge values
	 */
	reset(): void;
}

export namespace Gauge {
	interface Internal {
		/**
		 * Increment gauge with value
		 * @param value The value to increment with
		 * @param timestamp Timestamp to associate the time series with
		 */
		inc(value?: number, timestamp?: number | Date): void;

		/**
		 * Decrement with value
		 * @param value The value to decrement with
		 * @param timestamp Timestamp to associate the time series with
		 */
		dec(value?: number, timestamp?: number | Date): void;

		/**
		 * Set gauges value
		 * @param value The value to set
		 * @param timestamp Timestamp to associate the time series with
		 */
		set(value: number, timestamp?: number | Date): void;

		/**
		 * Set gauge value to current epoch time in ms
		 */
		setToCurrentTime(): void;

		/**
		 * Start a timer where the gauges value will be the duration in seconds
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: labelValues) => void;
	}
}

export interface HistogramConfiguration {
	name: string;
	help: string;
	labelNames?: string[];
	buckets?: number[];
	registers?: Registry[];
	aggregator?: Aggregator;
}

/**
 * A histogram samples observations (usually things like request durations or response sizes) and counts them in configurable buckets
 */
export class Histogram {
	/**
	 * @param configuration Configuration when creating the Histogram. Name and Help is mandatory
	 */
	constructor(configuration: HistogramConfiguration);

	/**
	 * @param name The name of metric
	 * @param help Help description
	 * @param labels Label keys
	 * @param config Configuration object for Histograms
	 */
	constructor(
		name: string,
		help: string,
		labels?: string[],
		config?: Histogram.Config
	);
	/**
	 * @param name The name of metric
	 * @param help Help description
	 * @param config Configuration object for Histograms
	 * @deprecated
	 */
	constructor(name: string, help: string, config: Histogram.Config);

	/**
	 * Observe value
	 * @param value The value to observe
	 */
	observe(value: number): void;
	/**
	 * Observe value for given labels
	 * @param labels Object with label keys and values
	 * @param value The value to observe
	 */
	observe(labels: labelValues, value: number): void;

	/**
	 * Start a timer where the value in seconds will observed
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: labelValues): (labels?: labelValues) => void;

	/**
	 * Reset histogram values
	 */
	reset(): void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured histogram with given labels
	 */
	labels(...values: string[]): Histogram.Internal;
}

export namespace Histogram {
	interface Internal {
		/**
		 * Observe value
		 * @param value The value to observe
		 */
		observe(value: number): void;

		/**
		 * Start a timer where the value in seconds will observed
		 * @param labels Object with label keys and values
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: labelValues) => void;
	}

	interface Config {
		/**
		 * Buckets used in the histogram
		 */
		buckets?: number[];
	}
}

export interface SummaryConfiguration {
	name: string;
	help: string;
	labelNames?: string[];
	percentiles?: number[];
	registers?: Registry[];
	aggregator?: Aggregator;
}

/**
 * A summary samples observations
 */
export class Summary {
	/**
	 * @param configuration Configuration when creating Summary metric. Name and Help is mandatory
	 */
	constructor(configuration: SummaryConfiguration);

	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param labels Label keys
	 * @param config Configuration object
	 */
	constructor(
		name: string,
		help: string,
		labels?: string[],
		config?: Summary.Config
	);
	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param config Configuration object
	 * @deprecated
	 */
	constructor(name: string, help: string, config: Summary.Config);

	/**
	 * Observe value in summary
	 * @param value The value to observe
	 */
	observe(value: number): void;
	/**
	 * Observe value for given labels
	 * @param labels Object with label keys and values
	 * @param value Value to observe
	 */
	observe(labels: labelValues, value: number): void;

	/**
	 * Start a timer where the value in seconds will observed
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: labelValues): (labels?: labelValues) => void;

	/**
	 * Reset all values in the summary
	 */
	reset(): void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured summary with given labels
	 */
	labels(...values: string[]): Summary.Internal;
}

export namespace Summary {
	interface Internal {
		/**
		 * Observe value in summary
		 * @param value The value to observe
		 */
		observe(value: number): void;

		/**
		 * Start a timer where the value in seconds will observed
		 * @param labels Object with label keys and values
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: labelValues) => void;
	}

	interface Config {
		/**
		 * Configurable percentiles, values should never be greater than 1
		 */
		percentiles?: number[];
	}
}

/**
 * Push metrics to a Pushgateway
 */
export class Pushgateway {
	/**
	 * @param url Complete url to the Pushgateway. If port is needed append url with :port
	 * @param options Options
	 * @param registry Registry
	 */
	constructor(url: string, options?: any, registry?: Registry);

	/**
	 * Add metric and overwrite old ones
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	pushAdd(
		params: Pushgateway.Parameters,
		callback: (error?: Error, httpResponse?: any, body?: any) => void
	): void;

	/**
	 * Overwrite all metric (using PUT to Pushgateway)
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	push(
		params: Pushgateway.Parameters,
		callback: (error?: Error, httpResponse?: any, body?: any) => void
	): void;

	/**
	 * Delete all metrics for jobName
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	delete(
		params: Pushgateway.Parameters,
		callback: (error?: Error, httpResponse?: any, body?: any) => void
	): void;
}

export namespace Pushgateway {
	interface Parameters {
		/**
		 * Jobname that is pushing the metric
		 */
		jobName: string;
		/**
		 * Label sets used in the url when making a request to the Pushgateway,
		 */
		groupings?: {
			[key: string]: string;
		};
	}
}

/**
 * Create an array with equal spacing between the elements
 * @param start The first value in the array
 * @param width The spacing between the elements
 * @param count The number of items in array
 * @return An array with the requested number of elements
 */
export function linearBuckets(
	start: number,
	width: number,
	count: number
): number[];

/**
 * Create an array that grows exponentially
 * @param start The first value in the array
 * @param factor The exponential factor
 * @param count The number of items in array
 * @return An array with the requested number of elements
 */
export function exponentialBuckets(
	start: number,
	factor: number,
	count: number
): number[];

export interface DefaultMetricsCollectorConfiguration {
	timeout?: number;
	register?: Registry;
}

/**
 * Configure default metrics
 * @param config Configuration object for default metrics collector
 * @return The setInterval number
 */
export function collectDefaultMetrics(
	config?: DefaultMetricsCollectorConfiguration
): number;

/**
 * Configure default metrics
 * @param timeout The interval how often the default metrics should be probed
 * @deprecated A number to defaultMetrics is deprecated, please use \`collectDefaultMetrics({ timeout: ${timeout} })\`.
 * @return The setInterval number
 */
export function collectDefaultMetrics(timeout: number): number;

export interface defaultMetrics {
	/**
	 * All available default metrics
	 */
	metricsList: string[];
}

// Type definitions for prom-client
// Definitions by: Simon Nyberg http://twitter.com/siimon_nyberg

/**
 * Container for all registered metrics
 */
export class Registry {
	/**
	 * Get string representation for all metrics
	 */
	metrics(): Promise<string>;

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
	registerMetric<T extends string>(metric: Metric<T>): void;

	/**
	 * Get all metrics as objects
	 */
	getMetricsAsJSON(): Promise<metric[]>;

	/**
	 * Get all metrics as objects
	 */
	getMetricsAsArray(): Promise<metric[]>;

	/**
	 * Remove a single metric
	 * @param name The name of the metric to remove
	 */
	removeSingleMetric(name: string): void;

	/**
	 * Get a single metric
	 * @param name The name of the metric
	 */
	getSingleMetric<T extends string>(name: string): Metric<T> | undefined;

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
	getSingleMetricAsString(name: string): Promise<string>;

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
export type Collector = () => void;

/**
 * The register that contains all metrics
 */
export const register: Registry;

export class AggregatorRegistry extends Registry {
	/**
	 * Gets aggregated metrics for all workers.
	 * @return {Promise<string>} Promise that resolves with the aggregated
	 * metrics.
	 */
	clusterMetrics(): Promise<string>;

	/**
	 * Creates a new Registry instance from an array of metrics that were
	 * created by `registry.getMetricsAsJSON()`. Metrics are aggregated using
	 * the method specified by their `aggregator` property, or by summation if
	 * `aggregator` is undefined.
	 * @param {Array} metricsArr Array of metrics, each of which created by
	 *   `registry.getMetricsAsJSON()`.
	 * @return {Registry} aggregated registry.
	 */
	static aggregate(metricsArr: Array<Object>): Registry; // TODO Promise?

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
export type Metric<T extends string> =
	| Counter<T>
	| Gauge<T>
	| Summary<T>
	| Histogram<T>;

/**
 * Aggregation methods, used for aggregating metrics in a Node.js cluster.
 */
export type Aggregator = 'omit' | 'sum' | 'first' | 'min' | 'max' | 'average';

export enum MetricType {
	Counter,
	Gauge,
	Histogram,
	Summary,
}

type CollectFunction<T> = (this: T) => void | Promise<void>;

interface metric {
	name: string;
	help: string;
	type: MetricType;
	aggregator: Aggregator;
	collect: CollectFunction<any>;
}

type LabelValues<T extends string> = Partial<Record<T, string | number>>;

interface MetricConfiguration<T extends string> {
	name: string;
	help: string;
	labelNames?: T[] | readonly T[];
	registers?: Registry[];
	aggregator?: Aggregator;
	collect?: CollectFunction<any>;
}

export interface CounterConfiguration<T extends string>
	extends MetricConfiguration<T> {
	collect?: CollectFunction<Counter<T>>;
}

/**
 * A counter is a cumulative metric that represents a single numerical value that only ever goes up
 */
export class Counter<T extends string> {
	/**
	 * @param configuration Configuration when creating a Counter metric. Name and Help is required.
	 */
	constructor(configuration: CounterConfiguration<T>);

	/**
	 * Increment for given labels
	 * @param labels Object with label keys and values
	 * @param value The number to increment with
	 */
	inc(labels: LabelValues<T>, value?: number): void;

	/**
	 * Increment with value
	 * @param value The value to increment with
	 */
	inc(value?: number): void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured counter with given labels
	 */
	labels(...values: string[]): Counter.Internal;

	/**
	 * Return the child for given labels
	 * @param labels Object with label keys and values
	 * @return Configured counter with given labels
	 */
	labels(labels: LabelValues<T>): Counter.Internal;

	/**
	 * Reset counter values
	 */
	reset(): void;

	/**
	 * Remove metrics for the given label values
	 * @param values Label values
	 */
	remove(...values: string[]): void;

	/**
	 * Remove metrics for the given label values
	 * @param labels Object with label keys and values
	 */
	remove(labels: LabelValues<T>): void;
}

export namespace Counter {
	interface Internal {
		/**
		 * Increment with value
		 * @param value The value to increment with
		 */
		inc(value?: number): void;
	}
}

export interface GaugeConfiguration<T extends string>
	extends MetricConfiguration<T> {
	collect?: CollectFunction<Gauge<T>>;
}

/**
 * A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.
 */
export class Gauge<T extends string> {
	/**
	 * @param configuration Configuration when creating a Gauge metric. Name and Help is mandatory
	 */
	constructor(configuration: GaugeConfiguration<T>);

	/**
	 * Increment gauge for given labels
	 * @param labels Object with label keys and values
	 * @param value The value to increment with
	 */
	inc(labels: LabelValues<T>, value?: number): void;

	/**
	 * Increment gauge
	 * @param value The value to increment with
	 */
	inc(value?: number): void;

	/**
	 * Decrement gauge
	 * @param labels Object with label keys and values
	 * @param value Value to decrement with
	 */
	dec(labels: LabelValues<T>, value?: number): void;

	/**
	 * Decrement gauge
	 * @param value The value to decrement with
	 */
	dec(value?: number): void;

	/**
	 * Set gauge value for labels
	 * @param labels Object with label keys and values
	 * @param value The value to set
	 */
	set(labels: LabelValues<T>, value: number): void;

	/**
	 * Set gauge value
	 * @param value The value to set
	 */
	set(value: number): void;

	/**
	 * Set gauge value to current epoch time in ms
	 * @param labels Object with label keys and values
	 */
	setToCurrentTime(labels?: LabelValues<T>): void;

	/**
	 * Start a timer where the gauges value will be the duration in seconds
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: LabelValues<T>): (labels?: LabelValues<T>) => void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured gauge with given labels
	 */
	labels(...values: string[]): Gauge.Internal<T>;

	/**
	 * Return the child for given labels
	 * @param labels Object with label keys and values
	 * @return Configured counter with given labels
	 */
	labels(labels: LabelValues<T>): Gauge.Internal<T>;

	/**
	 * Reset gauge values
	 */
	reset(): void;

	/**
	 * Remove metrics for the given label values
	 * @param values Label values
	 */
	remove(...values: string[]): void;

	/**
	 * Remove metrics for the given label values
	 * @param labels Object with label keys and values
	 */
	remove(labels: LabelValues<T>): void;
}

export namespace Gauge {
	interface Internal<T extends string> {
		/**
		 * Increment gauge with value
		 * @param value The value to increment with
		 */
		inc(value?: number): void;

		/**
		 * Decrement with value
		 * @param value The value to decrement with
		 */
		dec(value?: number): void;

		/**
		 * Set gauges value
		 * @param value The value to set
		 */
		set(value: number): void;

		/**
		 * Set gauge value to current epoch time in ms
		 */
		setToCurrentTime(): void;

		/**
		 * Start a timer where the gauges value will be the duration in seconds
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: LabelValues<T>) => void;
	}
}

export interface HistogramConfiguration<T extends string>
	extends MetricConfiguration<T> {
	buckets?: number[];
	collect?: CollectFunction<Histogram<T>>;
}

/**
 * A histogram samples observations (usually things like request durations or response sizes) and counts them in configurable buckets
 */
export class Histogram<T extends string> {
	/**
	 * @param configuration Configuration when creating the Histogram. Name and Help is mandatory
	 */
	constructor(configuration: HistogramConfiguration<T>);

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
	observe(labels: LabelValues<T>, value: number): void;

	/**
	 * Start a timer where the value in seconds will observed
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: LabelValues<T>): (labels?: LabelValues<T>) => number;

	/**
	 * Reset histogram values
	 */
	reset(): void;

	/**
	 * Initialize the metrics for the given combination of labels to zero
	 */
	zero(labels: LabelValues<T>): void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured histogram with given labels
	 */
	labels(...values: string[]): Histogram.Internal<T>;

	/**
	 * Return the child for given labels
	 * @param labels Object with label keys and values
	 * @return Configured counter with given labels
	 */
	labels(labels: LabelValues<T>): Histogram.Internal<T>;

	/**
	 * Remove metrics for the given label values
	 * @param values Label values
	 */
	remove(...values: string[]): void;

	/**
	 * Remove metrics for the given label values
	 * @param labels Object with label keys and values
	 */
	remove(labels: LabelValues<T>): void;
}

export namespace Histogram {
	interface Internal<T extends string> {
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
		startTimer(): (labels?: LabelValues<T>) => void;
	}

	interface Config {
		/**
		 * Buckets used in the histogram
		 */
		buckets?: number[];
	}
}

export interface SummaryConfiguration<T extends string>
	extends MetricConfiguration<T> {
	percentiles?: number[];
	maxAgeSeconds?: number;
	ageBuckets?: number;
	compressCount?: number;
	collect?: CollectFunction<Summary<T>>;
}

/**
 * A summary samples observations
 */
export class Summary<T extends string> {
	/**
	 * @param configuration Configuration when creating Summary metric. Name and Help is mandatory
	 */
	constructor(configuration: SummaryConfiguration<T>);

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
	observe(labels: LabelValues<T>, value: number): void;

	/**
	 * Start a timer where the value in seconds will observed
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: LabelValues<T>): (labels?: LabelValues<T>) => void;

	/**
	 * Reset all values in the summary
	 */
	reset(): void;

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured summary with given labels
	 */
	labels(...values: string[]): Summary.Internal<T>;

	/**
	 * Return the child for given labels
	 * @param labels Object with label keys and values
	 * @return Configured counter with given labels
	 */
	labels(labels: LabelValues<T>): Summary.Internal<T>;

	/**
	 * Remove metrics for the given label values
	 * @param values Label values
	 */
	remove(...values: string[]): void;

	/**
	 * Remove metrics for the given label values
	 * @param labels Object with label keys and values
	 */
	remove(labels: LabelValues<T>): void;
}

export namespace Summary {
	interface Internal<T extends string> {
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
		startTimer(): (labels?: LabelValues<T>) => void;
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
		callback: (error?: Error, httpResponse?: any, body?: any) => void,
	): void;

	/**
	 * Overwrite all metric (using PUT to Pushgateway)
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	push(
		params: Pushgateway.Parameters,
		callback: (error?: Error, httpResponse?: any, body?: any) => void,
	): void;

	/**
	 * Delete all metrics for jobName
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	delete(
		params: Pushgateway.Parameters,
		callback: (error?: Error, httpResponse?: any, body?: any) => void,
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
	count: number,
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
	count: number,
): number[];

export interface DefaultMetricsCollectorConfiguration {
	register?: Registry;
	prefix?: string;
	gcDurationBuckets?: number[];
	eventLoopMonitoringPrecision?: number;
	labels?: Object;
}

/**
 * Configure default metrics
 * @param config Configuration object for default metrics collector
 */
export function collectDefaultMetrics(
	config?: DefaultMetricsCollectorConfiguration,
): void;

export interface defaultMetrics {
	/**
	 * All available default metrics
	 */
	metricsList: string[];
}

/**
 * Validate a metric name
 * @param name The name to validate
 * @return True if the metric name is valid, false if not
 */
export function validateMetricName(name: string): boolean;

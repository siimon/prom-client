// Type definitions for prom-client
// Definitions by: Simon Nyberg http://twitter.com/siimon_nyberg

/**
 * Container for all registered metrics
 */
export interface register {
	/**
	 * Get string representation for all metrics
	 */
	metrics(): string
	/**
	 * Remove all metrics from the registry
	 */
	clear(): void
	/**
	 * Get all metrics as objects
	 */
	getMetricsAsJSON(): metric[]
	/**
	 * Remove a single metric
	 * @param name The name of the metric to remove
	 */
	removeSingleMetric(name: string): void
}

/**
 * The register that contains all metrics
 */
export const register: register

export enum MetricType {
	Counter,
	Gauge,
	Histogram,
	Summary
}

interface metric {
	name: string,
	help: string,
	type: MetricType
}
interface labelValues {
	[key: string]: string|number
}

/**
 * A counter is a cumulative metric that represents a single numerical value that only ever goes up
 */
export class Counter {
	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param labels Label keys
	 */
	constructor(name: string, help: string, labels?: string[])

	/**
	 * Increment for given labels
	 * @param labels Object with label keys and values
	 * @param value The number to increment with
	 */
	inc(labels: labelValues, value?: number): void

	/**
	 * Increment with value
	 * @param value The value to increment with
	 */
	inc(value?: number): void

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured counter with given labels
	 */
	labels(...values: string[]): Counter.Internal
}


export namespace Counter {
	interface Internal {
		/**
		 * Increment with value
		 * @param value The value to increment with
		 */
		inc(value?: number): void
	}

}

/**
	A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.
*/
export class Gauge {
	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param labels Label keys
	 */
	constructor(name: string, help: string, labels?: string[])

	/**
	 * Increment gauge for given labels
	 * @param labels Object with label keys and values
	 * @param value The value to increment with
	 */
	inc(labels: labelValues, value?: number): void

	/**
	 * Increment gauge
	 * @param value The value to increment with
	 */
	inc(value?: number): void

	/**
	 * Decrement gauge
	 * @param labels Object with label keys and values
	 * @param value Value to decrement with
	 */
	dec(labels: labelValues, value?: number): void

	/**
	 * Decrement gauge
	 * @param value The value to decrement with
	 */
	dec(value?: number): void


	/**
	 * Set gauge value for labels
	 * @param lables Object with label keys and values
	 * @param value The value to set
	 */
	set(labels: labelValues, value: number): void

	/**
	 * Set gauge value
	 * @param value The value to set
	 */
	set(value: number): void

	/**
	 * Set gauge value to current epoch time in ms
	 * @param labels Object with label keys and values
	 */
	setToCurrentTime(labels?: labelValues): void

	/**
	 * Start a timer where the gauges value will be the duration in seconds
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: labelValues): (labels?: labelValues) => void

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured gauge with given labels
	 */
	labels(...values: string[]): Gauge.Internal
}

export namespace Gauge {
	interface Internal {
		/**
		 * Increment gauge with value
		 * @param value The value to increment with
		 */
		inc(value?: number): void

		/**
		 * Decrement with value
		 * @param value The value to decrement with
		 */
		dec(value?: number): void

		/**
		 * Set gauges value
		 * @param value The value to set
		 */
		set(value: number): void

		/**
	 	 * Set gauge value to current epoch time in ms
		 */
		setToCurrentTime(): void

		/**
		 * Start a timer where the gauges value will be the duration in seconds
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: labelValues) => void
	}
}

/**
 * A histogram samples observations (usually things like request durations or response sizes) and counts them in configurable buckets
 */
export class Histogram {
	/**
	 * @param name The name of metric
	 * @param help Help description
	 * @param labels Label keys
	 * @param config Configuration object for Histograms
	 */
	constructor(name: string, help: string, labels?: string[], config?: Histogram.Config)
	/**
	 * @param name The name of metric
	 * @param help Help description
	 * @param config Configuration object for Histograms
	 */
	constructor(name: string, help: string, config: Histogram.Config)

	/**
	 * Observe value
	 * @param value The value to observe
	 */
	observe(value: number): void
	/**
	 * Observe value for given labels
	 * @param labels Object with label keys and values
	 * @param value The value to observe
	 */
	observe(labels: labelValues, value: number): void
	/**
	 * Start a timer where the value in seconds will observed
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: labelValues): (labels?: labelValues) => void
	/**
	 * Reset histogram values
	 */
	reset(): void
	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured histogram with given labels
	 */
	labels(...values: string[]): Histogram.Internal
}

export namespace Histogram {
	interface Internal {
		/**
		 * Observe value
		 * @param value The value to observe
		 */
		observe(value: number): void
		/**
		 * Start a timer where the value in seconds will observed
		 * @param labels Object with label keys and values
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: labelValues) => void
	}

	interface Config {
		/**
		 * Buckets used in the histogram
		 */
		buckets?: number[]
	}
}

/**
 * A summary samples observations
 */
export class Summary {
	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param labels Label keys
	 * @param config Configuration object
	 */
	constructor(name: string, help: string, labels?: string[], config?: Summary.Config)
	/**
	 * @param name The name of the metric
	 * @param help Help description
	 * @param config Configuration object
	 */
	constructor(name: string, help: string, config: Summary.Config)

	/**
	 * Observe value in summary
	 * @param value The value to observe
	 */
	observe(value: number): void
	/**
	 * Observe value for given labels
	 * @param labels Object with label keys and values
	 * @param value Value to observe
	 */
	observe(labels: labelValues, value: number): void
	/**
	 * Start a timer where the value in seconds will observed
	 * @param labels Object with label keys and values
	 * @return Function to invoke when timer should be stopped
	 */
	startTimer(labels?: labelValues): (labels?: labelValues) => void
	/**
	 * Reset all values in the summary
	 */
	reset(): void

	/**
	 * Return the child for given labels
	 * @param values Label values
	 * @return Configured summary with given labels
	 */
	labels(...values: string[]): Summary.Internal
}

export namespace Summary {
	interface Internal {
		/**
		 * Observe value in summary
		 * @param value The value to observe
		 */
		observe(value: number): void
		/**
		 * Start a timer where the value in seconds will observed
		 * @param labels Object with label keys and values
		 * @return Function to invoke when timer should be stopped
		 */
		startTimer(): (labels?: labelValues) => void
	}

	interface Config {
		/**
		 * Configurable percentiles, values should never be greater than 1
		 */
		percentiles?: number[]
	}
}

/**
 * Push metrics to a Pushgateway
 */
export class Pushgateway {
	/**
	 * @param url Complete url to the Pushgateway. If port is needed append url with :port
	 */
	constructor(url: string)

	/**
	 * Add metric and overwrite old ones
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	pushAdd(params: Pushgateway.Parameters, callback: (error?: Error, httpResponse?: any, body?: any) => void): void;
	/**
	 * Overwrite all metric (using PUT to Pushgateway)
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	push(params: Pushgateway.Parameters, callback: (error?: Error, httpResponse?: any, body?: any) => void): void;
	/**
	 * Delete all metrics for jobName
	 * @param params Push parameters
	 * @param callback Callback when request is complete
	 */
	delete(params: Pushgateway.Parameters, callback: (error?: Error, httpResponse?: any, body?: any) => void): void;
}

export namespace Pushgateway {
	interface Parameters {
		/**
		 * Jobname that is pushing the metric
		 */
		jobName: string,
		/**
		 * Label sets used in the url when making a request to the Pushgateway,
		 */
		groupings?: {
			[key: string]: string
		}
	}
}

/**
 * Create an array with equal spacing between the elements
 * @param start The first value in the array
 * @param width The spacing between the elements
 * @param count The number of items in array
 * @return An array with the requested number of elements
 */
export function linearBuckets(start: number, width: number, count: number): number[]
/**
 * Create an array that grows exponentially
 * @param start The first value in the array
 * @param factor The exponential factor
 * @param count The number of items in array
 * @return An array with the requested number of elements
 */
export function exponentialBuckets(start: number, factor: number, count: number): number[]
/**
 * Configure default metrics
 * @param blacklist Metrics to blacklist, i.e. dont collect
 * @param interval The interval how often the default metrics should be probed
 * @return The setInterval number
 */
export function defaultMetrics(blacklist: string[], interval: number): number

export interface defaultMetrics {
	/**
	 * All enabled default metrics
	 */
	metricsList: string[]
}

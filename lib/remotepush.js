'use strict';

const url = require('url');
const http = require('http');
const https = require('https');
const snappy = require('snappyjs');
const prom = require('./prom');
const { globalRegistry } = require('./registry');

const METRIC_TYPES = {
	counter: 1,
	gauge: 2,
	histogram: 3,
	// GAUGEHISTOGRAM: 4,
	summary: 5,
	// INFO: 6,
	// STATESET: 7,
};

class RemotePush {
	constructor(remotePushUrl, options, registry) {
		if (!registry) {
			registry = globalRegistry;
		}
		this.registry = registry;
		this.remotePushUrl = remotePushUrl;
		this.requestOptions = Object.assign({}, options);
	}

	async push(timestamp = Date.now()) {
		const metrics = await this.register.getMetricsAsArray();

		if (!metrics.length) {
			return;
		}

		const timeseries = [];

		for (const metric of metrics) {
			const item = await metric.get();
			const type = METRIC_TYPES[item.type];
			if (!type) {
				throw new Error(
					`Unknown metric type is created ${item.type} by metric ${item.name}`,
				);
			}

			for (const value of item.values) {
				const labels = [
					{
						name: '__name__',
						value: value.metricName || item.name,
					},
					...toLabels(this.register._defaultLabels),
					...toLabels(value.labels),
				];
				timeseries.push({
					labels,
					samples: [
						{
							value: value.value,
							timestamp,
						},
					],
					metadata: [{ type }],
				});
			}
		}

		const payload = {
			timeseries,
		};

		const serialized = await serialize(payload);
		const compressed = snappy.compress(serialized);

		return useRemotePush.call(this, compressed);
	}
}

function serialize(payload) {
	const type = prom.prometheus.WriteRequest;
	const errMsg = type.verify(payload);
	if (errMsg) {
		throw new Error(errMsg);
	}
	const buffer = type.encode(payload).finish();
	return buffer;
}

function toLabels(labelsObject) {
	return Object.entries(labelsObject).map(([labelName, labelValue]) => {
		return {
			name: labelName,
			value: `${labelValue}`,
		};
	});
}

async function useRemotePush(message) {
	// eslint-disable-next-line node/no-deprecated-api
	const requestParams = url.parse(this.remotePushUrl);
	const httpModule = isHttps(requestParams.href) ? https : http;
	const options = Object.assign(requestParams, this.requestOptions, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-protobuf',
			'Content-Encoding': 'snappy',
			'X-Prometheus-Remote-Write-Version': '0.1.0',
		},
	});

	return new Promise((resolve, reject) => {
		const req = httpModule.request(options, resp => {
			resp.on('end', () => {
				resolve({ resp });
			});
		});
		req.on('error', err => {
			reject(err);
		});

		req.write(message);
		req.end();
	});
}

function isHttps(href) {
	return href.search(/^https/) !== -1;
}

module.exports = RemotePush;

'use strict';

const url = require('url');
const http = require('http');
const https = require('https');
const { globalRegistry } = require('./registry');

class Pushgateway {
	constructor(gatewayUrl, options, registry) {
		if (!registry) {
			registry = globalRegistry;
		}
		this.registry = registry;
		this.gatewayUrl = gatewayUrl;
		this.requestOptions = Object.assign({}, options);
	}

	pushAdd(params, callback) {
		if (!params || !params.jobName) {
			throw new Error('Missing jobName parameter');
		}

		useGateway.call(this, 'POST', params.jobName, params.groupings, callback);
	}

	push(params, callback) {
		if (!params || !params.jobName) {
			throw new Error('Missing jobName parameter');
		}

		useGateway.call(this, 'PUT', params.jobName, params.groupings, callback);
	}

	delete(params, callback) {
		if (!params || !params.jobName) {
			throw new Error('Missing jobName parameter');
		}

		useGateway.call(this, 'DELETE', params.jobName, params.groupings, callback);
	}
}
function useGateway(method, job, groupings, callback) {
	// `URL` first added in v6.13.0
	// eslint-disable-next-line node/no-deprecated-api
	const gatewayUrlParsed = url.parse(this.gatewayUrl);
	const gatewayUrlPath =
		gatewayUrlParsed.pathname && gatewayUrlParsed.pathname !== '/'
			? gatewayUrlParsed.pathname
			: '';
	const path = `${gatewayUrlPath}/metrics/job/${encodeURIComponent(
		job
	)}${generateGroupings(groupings)}`;

	// eslint-disable-next-line node/no-deprecated-api
	const target = url.resolve(this.gatewayUrl, path);
	// eslint-disable-next-line node/no-deprecated-api
	const requestParams = url.parse(target);
	const httpModule = isHttps(requestParams.href) ? https : http;
	const options = Object.assign(requestParams, this.requestOptions, {
		method
	});

	const req = httpModule.request(options, res => {
		let body = '';
		res.setEncoding('utf8');
		res.on('data', chunk => {
			body += chunk;
		});
		res.on('end', () => {
			callback(null, res, body);
		});
	});
	req.on('error', err => {
		callback(err);
	});

	if (method !== 'DELETE') {
		req.write(this.registry.metrics({ timestamps: false }));
	}
	req.end();
}

function generateGroupings(groupings) {
	if (!groupings) {
		return '';
	}
	return Object.keys(groupings)
		.map(
			key => `/${encodeURIComponent(key)}/${encodeURIComponent(groupings[key])}`
		)
		.join('');
}

function isHttps(href) {
	return href.search(/^https/) !== -1;
}

module.exports = Pushgateway;

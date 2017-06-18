'use strict';

const url = require('url');
const http = require('http');
const https = require('https');
const register = require('./register');

function Pushgateway(gatewayUrl, options, registry) {
	if (!registry) {
		registry = register;
	}
	this.registry = registry;
	this.gatewayUrl = gatewayUrl;
	this.requestOptions = Object.assign({}, options);
}

Pushgateway.prototype.pushAdd = function(params, callback) {
	if (!params || !params.jobName) {
		throw new Error('Missing jobName parameter');
	}

	useGateway.call(this, 'POST', params.jobName, params.groupings, callback);
};
Pushgateway.prototype.push = function(params, callback) {
	if (!params || !params.jobName) {
		throw new Error('Missing jobName parameter');
	}

	useGateway.call(this, 'PUT', params.jobName, params.groupings, callback);
};
Pushgateway.prototype.delete = function(params, callback) {
	if (!params || !params.jobName) {
		throw new Error('Missing jobName parameter');
	}

	useGateway.call(this, 'DELETE', params.jobName, params.groupings, callback);
};

function useGateway(method, job, groupings, callback) {
	const gatewayUrlParsed = url.parse(this.gatewayUrl);
	const gatewayUrlPath = gatewayUrlParsed.pathname &&
		gatewayUrlParsed.pathname !== '/'
		? gatewayUrlParsed.pathname
		: '';
	const path = [
		gatewayUrlPath,
		'/metrics/job/',
		encodeURIComponent(job),
		generateGroupings(groupings)
	].join('');

	const target = url.resolve(this.gatewayUrl, path);
	const requestParams = url.parse(target);
	const httpModule = isHttps(requestParams.href) ? https : http;
	const options = Object.assign(requestParams, this.requestOptions, {
		method
	});

	const req = httpModule.request(options, function(res) {
		let body = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			callback(null, res, body);
		});
	});
	req.on('error', function(err) {
		callback(err);
	});

	if (method !== 'DELETE') {
		req.write(this.registry.metrics());
	}
	req.end();
}

function generateGroupings(groupings) {
	if (!groupings) {
		return '';
	}
	return Object.keys(groupings)
		.map(function(key) {
			return [
				'/',
				encodeURIComponent(key),
				'/',
				encodeURIComponent(groupings[key])
			].join('');
		})
		.join('');
}

function isHttps(href) {
	return href.search(/^https/) !== -1;
}

module.exports = Pushgateway;

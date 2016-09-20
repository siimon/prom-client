'use strict';

var http = require('http');
var https = require('https');
var register = require('./register');

function Pushgateway(url) {
	this.gatewayUrl = url;
}

Pushgateway.prototype.pushAdd = function(params, callback) {
	if(!params || !params.jobName) {
		throw new Error('Missing jobName parameter');
	}

	useGateway.call(this, 'POST', params.jobName, params.groupings, callback);
};
Pushgateway.prototype.push = function(params, callback) {
	if(!params || !params.jobName) {
		throw new Error('Missing jobName parameter');
	}

	useGateway.call(this, 'PUT', params.jobName, params.groupings, callback);
};
Pushgateway.prototype.delete = function(params, callback) {
	if(!params || !params.jobName) {
		throw new Error('Missing jobName parameter');
	}

	useGateway.call(this, 'DELETE', params.jobName, params.groupings, callback);
};

function useGateway(method, job, groupings, callback) {
	var path = ['/metrics/job/', encodeURIComponent(job), generateGroupings(groupings)].join('');

	var httpModule = isHttps(this.gatewayUrl) ? https : http;

	var hostAndPort = getHostAndPort(this.gatewayUrl);
	var options = {
		method: method,
		hostname: hostAndPort.host,
		port: hostAndPort.port,
		path: path
	};

	var req = httpModule.request(options, function(res) {
		var body = '';
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

	if(method !== 'DELETE') {
		req.write(register.metrics());
	}
	req.end();
}

function generateGroupings(groupings) {
	if(!groupings) {
		return '';
	}
	return Object.keys(groupings).map(function(key) {
		return ['/', encodeURIComponent(key), '/', encodeURIComponent(groupings[key])].join('');
	}).join('');
}

function getHostAndPort(url) {
	var host;
	if(url.indexOf(':') === -1) {
		return { host: url, port: isHttps(url) ? 443 : 80 };
	}

	var parts = url.match(/https?:\/\/(.*):(\d*)/);
	return {
		host: parts[1],
		port: parts[2]
	};
}

function isHttps(url) {
	return url.search(/^https/) !== -1;
}

module.exports = Pushgateway;

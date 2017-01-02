'use strict';

var url = require('url');
var http = require('http');
var https = require('https');
var register = require('./register');

function Pushgateway(gatewayUrl) {
	this.gatewayUrl = gatewayUrl;
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
	var path = ['metrics/job/', encodeURIComponent(job), generateGroupings(groupings)].join('');

	var target = url.resolve(this.gatewayUrl, path);
	var requestParams = url.parse(target);
	var httpModule = isHttps(requestParams.href) ? https : http;
	var options = Object.assign(requestParams, {
		method: method
	});

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

function isHttps(href) {
	return href.search(/^https/) !== -1;
}

module.exports = Pushgateway;

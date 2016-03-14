'use strict';

var request = require('request');
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
	var url = [this.gatewayUrl, '/metrics/job/', encodeURIComponent(job), generateGroupings(groupings)].join('');
	var options = {
		body: register.metrics(),
		url: url,
		method: method
	};

	if(method === 'DELETE') {
		options.body = '';
	}

	request(options, callback);
}

function generateGroupings(groupings) {
	if(!groupings) {
		return '';
	}
	return Object.keys(groupings).map(function(key) {
		return [ '/', encodeURIComponent(key), '/', encodeURIComponent(groupings[key])].join('');
	}).join('');
}

module.exports = Pushgateway;

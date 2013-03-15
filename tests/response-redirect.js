'use strict';

var client = require('../');

var u = require('url');
var util = require('util');
var http = require('http');
var assert = require('assert');

var common = require('./includes/common.js');

var callbacks = {
	get: 0,
	head: 0
};

var assertions, requests = 2;

var server = http.createServer(function (req, res) {
	switch (req.url) {
		case '/foo':
			common.response(req, res);
		break;
		
		default:
			res.writeHead(301, {location: '/foo'});
			res.end();
		break;
	}
}).listen(common.options.port, function () {
	var url = u.format({
		protocol: 'http:',
		hostname: common.options.host,
		port: common.options.port,
		pathname: '/foo'
	});
	
	client.get(common.options.url, function (err, res) {
		util.log('http.get');
		callbacks.get++;
		assertions(err, res, url);
	});
	
	client.head(common.options.url, function (err, res) {
		util.log('http.head');
		callbacks.head++;
		assertions(err, res, url);
	});
});

assertions = function (err, res, url) {
	requests--;
	
	if (requests === 0) {
		server.close();
		util.log('http.createServer.close');
	}
	
	assert.ifError(err);
	assert.strictEqual(res.code, 200);
	assert.strictEqual(res.url, url);
};

common.teardown(callbacks);

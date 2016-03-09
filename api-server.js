'use strict';

var R = require('ramda');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var express = require('express');

var api = require('./api.js').api;
var serverPort = require('./api.js').serverPort;


function readJSONFile(filePath, cb) {
	fs.readFile(filePath, function(err, data) {
		if (err) {
			cb(err);
		} else {
			var json = JSON.parse(data.toString());
			cb(null, json);
		}
	});
}


if (require.main === module) {
	var app = express();

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});

	R.values(api)
		.forEach(function(item) {
			console.log(item.url);

			app.get(item.url, function(req, res) {
				readJSONFile(item.file, function(err, data) {
					if (err) {
						res.json({
							error: true,
							message: err.message
						});
					} else {
						res.json(data);
					}
				});
			});
		});

	app.listen(serverPort, function() {
		console.log(chalk.cyan(`http://localhost:${serverPort}`));
	});
}

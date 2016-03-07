'use strict';

const path = require('path');
const urljoin = require('url-join');
const constants = require('./app/scripts/constants.js');

const dataPath = './app/data';
const urlPrefix = '/api';
module.exports.serverDomain = 'localhost';
module.exports.serverPort = 4000;

module.exports.api = {
	'relations': {
		url: urljoin(urlPrefix, 'relations'),
		file: path.join(dataPath, constants.MODEL_RELATIONS_LIBRARY),
	},
	'patterns': {
		url: urljoin(urlPrefix, 'patterns'),
		file: path.join(dataPath, constants.MODEL_PATTERNS_LIBRARY),
	},
};

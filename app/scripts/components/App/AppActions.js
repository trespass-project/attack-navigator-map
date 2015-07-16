'use strict';

var $ = require('jquery');
var _ = require('lodash');
var flummox = require('flummox');


class AppActions extends flummox.Actions {

	constructor() {
		super();
	}

	loadModel(filename) {
		var promise = $.ajax({
			url: 'data/' + filename,
			dataType: 'text', // not 'xml'
		});

		return {
			promise: promise
		};
	}

	modelAdd(type, data) {
		return { type, data };
	}

}


module.exports = AppActions;

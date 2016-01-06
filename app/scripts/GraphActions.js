'use strict';

var flummox = require('flummox');
var Actions = flummox.Actions;
var $ = require('jquery');


module.exports =
class GraphActions extends Actions {

	loadModel(filename) {
		var promise = $.ajax({
			url: 'data/' + filename,
			dataType: 'text', // not 'xml'
		});

		return {promise};
	}

	modelAdd(type, data) {
		return {type, data};
	}

	// —————

	cloneGroup(group) {
		return {group};
	}

	cloneNode(node) {
		return {node};
	}

};

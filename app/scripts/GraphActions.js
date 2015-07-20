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

		return {
			promise: promise
		};
	}

	modelAdd(type, data) {
		return { type, data };
	}

	// —————

	importModelFragment(fragment, xy) {
		return {fragment, xy};
	}

	addEdge(edge) {
		return {edge};
	}

	removeEdge(edge) {
		return {edge};
	}

	removeGroup(group, removeNodes=false) {
		return {group, removeNodes};
	}

	addNode(node) {
		return {node};
	}

	removeNode(node) {
		return {node};
	}

};

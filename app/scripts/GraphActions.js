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

	removeEdge(edge) {
		return {edge};
	}

	cloneGroup(group) {
		return {group};
	}

	addNodeToGroup(node, group) {
		return {node, group};
	}

	ungroupNode(node) {
		return {node};
	}

	addNode(node) {
		return {node};
	}

	cloneNode(node) {
		return {node};
	}

	removeNode(node) {
		return {node};
	}

};

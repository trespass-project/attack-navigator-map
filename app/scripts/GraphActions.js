'use strict';

var flummox = require('flummox');
var Actions = flummox.Actions;


module.exports =
class GraphActions extends Actions {

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

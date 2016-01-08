'use strict';

var _ = require('lodash');
var flummox = require('flummox');
var Store = flummox.Store;
var saveAs = require('browser-saveas');
var R = require('ramda');
var mout = require('mout');
var trespass = require('trespass.js');
var helpers = require('./helpers.js');
var constants = require('./constants.js');
var dirs = require('../../variables.js').dirs;


const types = [
	// 'edge',

	'location',
	// 'asset',
	'item',
	'data',
	'actor',
	'role',
	'predicate',
	'process',
	'policy'
];

var graph = {
	nodes: [],
	edges: [],
	groups: [],
};


module.exports =
class GraphStore extends Store {

	modelAdd(action) {
		const {type, data} = action;
		let method = 'add' + mout.string.pascalCase(type);
		if (!mout.object.has(trespass.model, method)) {
			method = 'add_';
		}
		let model = trespass.model[method](this.state.model, data);
		this.setState({ model: model });
	}


	// remove missing nodes
	_cleanupGroups() {
		let nodes = this.state.graph.nodes;
		let groups = this.state.graph.groups;

		groups.forEach(function(group) {
			group.nodeIds = group.nodeIds.filter(function(id) {
				let node = helpers.getItemById(nodes, id);
				return (!!node);
			});
		});
	}

};

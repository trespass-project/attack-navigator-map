'use strict';

let _ = require('lodash');
let R = require('ramda');
let trespass = require('trespass.js');
let helpers = require('./helpers.js');


const modelComponents =
module.exports.modelComponents = [
	'locations',
	'edges',
	'assets',
	'actors',
	'roles',
	'predicates',
	'processes',
	'policies'
];


let importModelFragment =
module.exports.importModelFragment =
function(currentGraph, fragment, xy) {
	xy = xy || { x: 0, y: 0 };
	fragment = prepareFragment( _.merge({}, fragment) );

	let graph = _.merge({}, currentGraph);

	const nodes = (fragment.nodes || [])
		.map(function(node, index) {
			return _.merge({}, node, {
				x: xy.x + (node.x || index * 60),
				y: xy.y + (node.y || index * 30),
				// id: helpers.makeId(index, 'node')
			});
		});
	graph.nodes = graph.nodes.concat(nodes);

	const groups = (fragment.groups || [])
		.map(function(group, index) {
			// return _.merge({}, group, {
			// 	id: helpers.makeId(index, 'group')
			// });
			return group;
		});
	graph.groups = graph.groups.concat(groups);

	const edges = (fragment.edges || [])
		.map(function(edge, index) {
			// return _.merge({}, edge, {
			// 	id: helpers.makeId(index, 'edge')
			// });
			return edge;
		});
	graph.edges = graph.edges.concat(edges);

	return graph;
};


let prepareFragment =
module.exports.prepareFragment =
function(fragment) {
	(fragment.nodes || []).forEach(function(node, index) {
		let oldId = node.id;

		// create unique id
		node.id = helpers.makeId(index, node.type);

		// rename existing ids in edges and groups
		if (oldId) {
			(fragment.edges || []).forEach(function(edge) {
				if (edge.from === oldId) {
					edge.from = node.id;
				}
				if (edge.to === oldId) {
					edge.to = node.id;
				}
			});

			(fragment.groups || []).forEach(function(group, index) {
				group.id = helpers.makeId(index, 'group');
				group.nodeIds = group.nodeIds.map(function(nodeId) {
					if (nodeId === oldId) {
						return node.id;
					} else {
						return nodeId;
					}
				});
			});
		}
	});

	return fragment;
};


let XMLModelToObject =
module.exports.XMLModelToObject =
function(xml) {
	return trespass.model.parse(xml);
};


let modelAsFragment =
module.exports.modelAsFragment =
function(model) {
	return R.pick(modelComponents, model.system);
};


let modelFromGraph =
module.exports.modelFromGraph =
function(graph) {
	let model = trespass.model.create();

	graph.edges.forEach(function(edge) {
		trespass.model.addEdge(model, {
			// TODO: ?
			_relation: edge.relation || null,
			source: edge.from,
			target: edge.to,
		});
	});

	graph.nodes.forEach(function(node) {
		try {
			switch (node.type) {
				case 'location':
					trespass.model.addLocation(model, node);
					break;
				// case 'asset':
				case 'item':
					trespass.model.addItem(model, node);
					break;
				case 'data':
					trespass.model.addData(model, node);
					break;
				case 'actor':
					trespass.model.addActor(model, node);
					break;
				case 'role':
					trespass.model.addRole(model, node);
					break;
				case 'predicate':
					trespass.model.addPredicate(model, node);
					break;
				case 'process':
					trespass.model.addProcess(model, node);
					break;
				case 'policy':
					trespass.model.addPolicy(model, node);
					break;
				default:
					break;
			}
		} catch (e) {
			// console.error(e.message);
		}
	});

	return model;
};

'use strict';

let _ = require('lodash');
let R = require('ramda');
let trespass = require('trespass.js');
let helpers = require('./helpers.js');


const modelComponents =
module.exports.modelComponents = [
	' modelComponents =locations',
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
function importModelFragment(currentGraph, fragment, xy) {
	xy = xy || { x: 0, y: 0 };
	fragment = prepareFragment( _.merge({}, fragment) );

	let graph = _.merge({}, currentGraph);

	const nodes = (fragment.nodes || [])
		.map(function(node, index) {
			return _.merge({}, node, {
				x: xy.x + (node.x || index * 60),
				y: xy.y + (node.y || index * 30),
				// id: helpers.makeId('node')
			});
		});
	graph.nodes = graph.nodes.concat(nodes);

	const groups = (fragment.groups || [])
		.map(function(group, index) {
			// return _.merge({}, group, {
			// 	id: helpers.makeId('group')
			// });
			return group;
		});
	graph.groups = graph.groups.concat(groups);

	const edges = (fragment.edges || [])
		.map(function(edge, index) {
			// return _.merge({}, edge, {
			// 	id: helpers.makeId('edge')
			// });
			return edge;
		});
	graph.edges = graph.edges.concat(edges);

	return graph;
};


let prepareFragment =
module.exports.prepareFragment =
function prepareFragment(fragment) {
	let nodeIds = [];
	(fragment.nodes || []).forEach(function(node, index) {
		const oldId = node.id;

		// create unique id
		do {
			node.id = helpers.makeId(node.type);
		} while (R.contains(node.id, nodeIds));
		nodeIds.push(node.id);

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
				group.id = helpers.makeId('group');
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
function XMLModelToObject(xml) {
	return trespass.model.parse(xml);
};


let downloadAsXML =
module.exports.downloadAsXML =
function downloadAsXML(model, filename) {
	const xml = trespass.model.xmlify(model);
	const blob = new Blob(
		[xml],
		{ type: 'text/plain;charset=utf-8' }
	);
	if (document) {
		let saveAs = require('browser-saveas');
		saveAs(blob, filename || 'model.xml');
	}
	return blob;
};


let modelAsFragment =
module.exports.modelAsFragment =
function modelAsFragment(model) {
	return R.pick(modelComponents, model.system);
};


let modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph) {
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


let removeGroup =
module.exports.removeGroup =
function removeGroup(graph, groupId, removeNodes=false) {
	graph.groups = graph.groups
		.filter(function(group) {
			const keep = (groupId != group.id);
			if (!keep && removeNodes) {
				// remove nodes
				group.nodeIds.forEach(function(nodeId) {
					removeNode(graph, nodeId);
				});
			}
			return keep;
		});
	return graph;
};


let cloneGroup =
module.exports.cloneGroup =
function cloneGroup(graph, _group) {
	let group = _.merge({}, _group);

	// create fragment from group
	const groupNodes = group.nodeIds.map(function(nodeId) {
		// all nodes referenced in group
		return helpers.getItemById(graph.nodes, nodeId);
	});
	const nodes = groupNodes.map(function(node) {
		let newNode = _.merge({}, node);
		newNode.x = node.x + 100;
		newNode.y = node.y + 100;
		return newNode;
	});
	const nodeIds = nodes.map(function(node) {
		return node.id;
	});
	const edges = graph.edges
		.filter(function(edge) {
			// of all edges return only those,
			// where `from` and `to` are in this group
			return R.contains(edge.from, nodeIds) &&
				R.contains(edge.to, nodeIds);
		})
		.map(function(edge) {
			return _.merge({}, edge);
		});
	let fragment = {
		nodes: nodes,
		edges: edges,
		groups: [group]
	};

	// prepare fragment
	fragment = prepareFragment(graph, fragment);

	// add fragment
	// returns new graph
	return importModelFragment(graph, fragment);
};


let addNode =
module.exports.addNode =
function addNode(graph, node, opts) {
	opts = opts || {};
	node = _.defaults(node, {
		id: helpers.makeId('node'),
		label: 'new node'
	});

	if (opts.toGroup) {
		opts.toGroup.nodeIds.push(node.id);
		opts.toGroup.nodeIds = R.uniq(opts.toGroup.nodeIds);
	}

	graph.nodes.push(node);
	return graph;
};


let getNodeGroups =
module.exports.getNodeGroups =
function getNodeGroups(nodeId, groups) {
	return groups.filter(function(group) {
		return R.contains(nodeId, group.nodeIds);
	});
};


let removeNode =
module.exports.removeNode =
function removeNode(graph, nodeId) {
	// remove node
	graph.nodes = graph.nodes
		.filter(function(node) {
			return nodeId != node.id;
		});

	// and also all edges connected to it
	graph.edges = graph.edges
		.filter(function(edge) {
			return (edge.from !== nodeId) && (edge.to !== nodeId);
		});

	// remove from groups
	graph.groups
		.forEach(function(group) {
			group.nodeIds = group.nodeIds
				.filter(function(groupNodeId) {
					return groupNodeId !== nodeId;
				});
		});
	return graph;
};

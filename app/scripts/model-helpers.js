'use strict';

let _ = require('lodash');
let R = require('ramda');
let trespass = require('trespass.js');
let helpers = require('./helpers.js');
let constants = require('./constants.js');


const modelComponents =
module.exports.modelComponents = [
	'locations',
	'edges',
	// 'assets',
	'data',
	'items',
	'actors',
	'roles',
	'predicates',
	'processes',
	'policies'
];

const modelComponentsSingular =
module.exports.modelComponentsSingular = {
	'locations': 'location',
	'edges': 'edge',
	// 'assets': 'asset',
	'data': 'data',
	'items': 'item',
	'actors': 'actor',
	'roles': 'role',
	'predicates': 'predicate',
	'processes': 'process',
	'policies': 'policy',
};

const nondirectedRelationTypes =
module.exports.nondirectedRelationTypes =
['network', 'connects'];



let importModelFragment =
module.exports.importModelFragment =
function importModelFragment(currentGraph, fragment, xy={ x: 0, y: 0 }) {
	let graph = _.merge({}, currentGraph);

	const nodes = (fragment.nodes || [])
		.map(function(node, index) {
			return createNode(
				_.merge({}, node, {
					x: xy.x + (node.x || index * 60),
					y: xy.y + (node.y || index * 30)
				}),
				(!!node.id) // if it has an id, keep it
			);
		});
	graph.nodes = (graph.nodes || []).concat(nodes);

	const groups = (fragment.groups || []);
	graph.groups = (graph.groups || []).concat(groups);

	const edges = (fragment.edges || []);
	graph.edges = (graph.edges || []).concat(edges);

	return graph;
};


let prepareFragment =
module.exports.prepareFragment =
function prepareFragment(fragment) {
	(fragment.nodes || []).forEach(function(node, index) {
		const oldId = node.id;

		// create unique id
		node.id = helpers.makeId('node');

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


let XMLModelToGraph =
module.exports.XMLModelToGraph =
function XMLModelToGraph(xml) {
	const $system = trespass.model.parse(xml)('system');
	const model = trespass.model.prepare($system);
	let graph = graphFromModel(model);

	let colCounter = 0;
	let rowCounter = 0;
	let lastGroupIndex = 0;
	const maxNodesPerCol = 7;
	['locations', // TODO: get this from somewhere else
	'items',
	'data',
	'actors',
	'roles',
	'predicates',
	'processes',
	'policies'].forEach(function(key, index) {
		const coll = model.system[key] || [];
		let group = {
			name: key,
			id: helpers.makeId('group'),
			nodeIds: []
		};
		coll.forEach(function(item) {
			group.nodeIds.push(item.id);

			// TODO: set position, if not present
			let node = helpers.getItemById(graph.nodes, item.id);

			if (rowCounter > maxNodesPerCol || lastGroupIndex !== index) {
				rowCounter = 0;
				colCounter++;
				lastGroupIndex = index;
			}
			const col = colCounter;
			const row = rowCounter;
			const spacing = 75;
			node.label = item.id;
			node.modelComponentType = modelComponentsSingular[key];
			node.x = col * spacing;
			node.y = row * spacing;
			rowCounter++;
		});
		if (group.nodeIds.length) {
			graph.groups.push(group);
		}
	});

	// TODO: refine, generalize, ...

	return graph;
};


let downloadAsXML =
module.exports.downloadAsXML =
function downloadAsXML(model, filename) {
	const xml = trespass.model.toXML(model);
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


let graphFromModel =
module.exports.graphFromModel =
function graphFromModel(model) {
	let graph = {
		nodes: [],
		edges: [],
		groups: [],
	};

	// for each edge in model, create edge in graph
	graph.edges = model.system.edges.map(function(edge) {
		return {
			from: edge.source,
			to: edge.target,
			directed: edge.directed
		};
	});

	['locations', // TODO: get this from somewhere else
	'items',
	'data',
	'actors',
	'roles',
	'predicates',
	'processes',
	'policies'].forEach(function(key) {
		const coll = model.system[key].map(R.identity);
		graph.nodes = R.concat(graph.nodes, coll);
	});

	// TODO: anything missing?
	return graph;
};


let modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph) {
	let model = trespass.model.create();

	graph.edges.forEach(function(edge) {
		trespass.model.addEdge(model, {
			source: edge.from,
			target: edge.to,
			directed: edge.directed,
		});
	});

	graph.nodes.forEach(function(_node) {
		const type = _node.modelComponentType;
		let node = R.omit(['name', 'label', 'x', 'y', 'modelComponentType'], _node);
		try {
			switch (type) {
				case 'location':
					trespass.model.addLocation(model, node);
					break;
				case 'item':
					trespass.model.addItem(model, node);
					break;
				case 'data':
					trespass.model.addData(model, node);
					break;
				// case 'asset':
				// 	trespass.model.addAsset(model, node);
				// 	break;
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


let createNode =
module.exports.createNode =
function createNode(node={}, keepId=false) {
	const id = (keepId && node.id)
		? node.id
		: helpers.makeId('node');

	return _.merge({}, node, {
		x: (node.x || 0),
		y: (node.y || 0),
		id: id
	});
};

function createEdge(edge={}) {
	return _.merge({}, edge);
}

function createGroup(group={}) {
	return _.merge({}, group);
}


let cloneNode =
module.exports.cloneNode =
function cloneNode(graph, origNode) {
	// duplicate node
	const nodes = [origNode]
		.map(createNode) // new id + offset
		.map(function(node) {
			return _.merge({}, node, {
				x: node.x + constants.CLONE_OFFSET,
				y: node.y + constants.CLONE_OFFSET,
			});
		});
	const newNode = nodes[0];

	// also duplicate any existing edges
	const edges = graph.edges
		// find edges to / from original node
		.filter(function(edge) {
			return R.contains(edge.from, [origNode.id]) || R.contains(edge.to, [origNode.id]);
		})
		// change reference to new node
		.map(function(_edge) {
			let edge = createEdge(_edge);
			if (edge.from === origNode.id) { edge.from = newNode.id; }
			if (edge.to === origNode.id) { edge.to = newNode.id; }
			return edge;
		});

	// if node is in a group, so is the clone
	let groups = getNodeGroups(origNode.id, graph.groups);
	groups.forEach(function(group) {
		group.nodeIds.push(newNode.id);
	});

	const fragment = {
		nodes: nodes,
		edges: edges,
		groups: []
	};

	// add fragment
	return importModelFragment(graph, fragment/*, xy*/);
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
	const nodes = groupNodes.map(createNode);
	const nodeIds = nodes.map(R.prop('id'));
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

	const xy = {
		x: constants.CLONE_OFFSET,
		y: constants.CLONE_OFFSET,
	};

	// prepare fragment
	fragment = prepareFragment(fragment);

	// add fragment; returns new graph
	return importModelFragment(graph, fragment, xy);
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


let getEdgeNodes =
module.exports.getEdgeNodes =
function getEdgeNodes(edge, nodes) {
	const edgeNodes = {
		fromNode: helpers.getItemById(nodes, edge.from),
		toNode: helpers.getItemById(nodes, edge.to),
	};
	return edgeNodes;
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


let updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(graph, componentType, componentId, newProperties) {
	let list = {
		'node': graph.nodes,
		'edge': graph.edges,
		'group': graph.groups,
	}[componentType] || [];

	list = list.map(function(item) {
		if (item.id === componentId) {
			if (componentType === 'edge') {
				newProperties.directed =
					(R.contains(item.relation, nondirectedRelationTypes))
						? false
						: true;
			}
			return _.merge(item, newProperties);
		} else {
			return item;
		}
	});
	return graph;
};

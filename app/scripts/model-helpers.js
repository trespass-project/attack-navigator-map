'use strict';

let _ = require('lodash');
let R = require('ramda');
let properCase = require('mout/string/properCase');
let trespass = require('trespass.js');
let helpers = require('./helpers.js');
const constants = require('./constants.js');


const modelComponents =
module.exports.modelComponents =
trespass.model.collectionNames;

const modelComponentsSingular =
module.exports.modelComponentsSingular =
trespass.model.collectionNameSingular;

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
	// let fragment = _.merge({}, fragment);

	(fragment.nodes || []).forEach(function(node, index) {
		// TODO: id should be optional
		const oldId = node.id;

		// new id
		node.id = helpers.makeId('node');

		// rename existing ids in edges and groups
		if (oldId) {
			fragment.edges = (fragment.edges || []).map(function(_edge) {
				let edge = createEdge(_edge); // new id
				edge = replaceIdInEdge(edge, oldId, node.id);
				return edge;
			});

			fragment.groups = (fragment.groups || []).map(function(_group) {
				let group = createGroup(_group); // new id
				group.nodeIds = (group.nodeIds || []).map(function(nodeId) {
					return (nodeId === oldId)
						? node.id
						: nodeId;
				});
				return group;
			});
		}
	});

	return fragment;
};


let XMLModelToGraph =
module.exports.XMLModelToGraph =
function XMLModelToGraph(xmlStr, done) {
	// TODO: write test

	trespass.model.parse(xmlStr, function(err, model) {
		if (err) { return done(err); }

		let graph = graphFromModel(model);

		let colCounter = 0;
		let rowCounter = 0;
		let lastGroupIndex = 0;
		const maxNodesPerCol = 7;
		let isShifted = true;
		const spacing = 100;
		let xOffset = spacing / 2;
		const yOffset = spacing / 2;

		// create groups for the different types
		modelComponents.forEach(function(key, index) {
			const coll = model.system[key] || [];
			let group = {
				name: key,
				id: helpers.makeId('group'),
				nodeIds: []
			};
			coll.forEach(function(item) {
				group.nodeIds.push(item.id);

				let node = helpers.getItemById(graph.nodes, item.id);

				// basic auto-layout
				if (rowCounter > maxNodesPerCol || lastGroupIndex !== index) {
					if (lastGroupIndex !== index) {
						lastGroupIndex = index;
						isShifted = true;
						xOffset += spacing / 2;
					} else {
						isShifted = !isShifted;
					}

					rowCounter = 0;
					colCounter++;
				}
				node.label = item.id;
				node.modelComponentType = modelComponentsSingular[key];
				node.x = xOffset + colCounter * spacing;
				node.y = yOffset + rowCounter * spacing + ((isShifted) ? 0 : 20);
				rowCounter++;
			});
			if (group.nodeIds.length) {
				graph.groups.push(group);
			}
		});

		// TODO: refine, generalize, ...

		done(null, graph);
	});
};


let downloadAsXML =
module.exports.downloadAsXML =
function downloadAsXML(model, filename) {
	const xml = trespass.model.toXML(model);
	const blob = new Blob(
		[xml],
		{ type: 'text/plain;charset=utf-8' }
	);
	if (document) { // only in browser
		const saveAs = require('browser-saveas');
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

	R.without(['edges'], modelComponents).forEach(function(key) {
		const coll = model.system[key]; /*.map(R.identity)*/
		graph.nodes = R.concat(graph.nodes, coll);
	});

	// TODO: anything missing?
	return graph;
};


let modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph) {
	let model = trespass.model.create();

	(graph.edges || []).forEach(function(edge) {
		trespass.model.addEdge(model, {
			source: edge.from,
			target: edge.to,
			// TODO: kind
			directed: edge.directed,
		});
	});

	(graph.nodes || []).forEach(function(node) {
		const type = node.modelComponentType;
		const fnName = 'add' + properCase(type);
		const addFn = trespass.model[fnName];
		if (!addFn) {
			console.warn(fnName+'()', 'not found');
		} else {
			addFn(
				model,
				R.omit([
					/*'name', */
					'label',
					'x',
					'y',
					'modelComponentType'
				], node)
			);
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
	const id = (keepId === true && node.id)
		? node.id
		: helpers.makeId('node');
	return _.merge({}, node, {
		x: (node.x || 0),
		y: (node.y || 0),
		id
	});
};

let createEdge = // TODO: test
module.exports.createEdge =
function createEdge(edge={}, keepId=false) {
	const id = (keepId === true && edge.id)
		? edge.id
		: helpers.makeId('edge');
	return _.merge({}, edge, {
		id
	});
};

let createGroup = // TODO: test
module.exports.createGroup =
function createGroup(group={}, keepId=false) {
	const id = (keepId === true && group.id)
		? group.id
		: helpers.makeId('group');
	return _.merge({}, group, {
		id
	});
};


let cloneNode =
module.exports.cloneNode =
function cloneNode(graph, origNode) {
	// duplicate node
	const nodes = [origNode] // new id + offset
		.map(function(node) {
			return createNode(node);
		})
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


let replaceIdInEdge =
module.exports.replaceIdInEdge =
function replaceIdInEdge(_edge, oldId, newId) {
	let edge = _.merge({}, _edge);
	if (edge.from === oldId) {
		edge.from = newId;
	}
	if (edge.to === oldId) {
		edge.to = newId;
	}
	return edge;
};


let cloneGroup =
module.exports.cloneGroup =
function cloneGroup(graph, groupId) {
	let origGroup = helpers.getItemById(graph.groups, groupId);
	let group = _.merge({}, origGroup);

	// TODO: write the following functions:
	// - nodeToFragment (includes node + edges)
	// - groupToFragment (includes group + nodes + edges)

	// create fragment from group

	const origGroupIds = group.nodeIds;
	const origGroupNodes = group.nodeIds
		.map(function(nodeId) {
			// all nodes referenced in group
			return helpers.getItemById(graph.nodes, nodeId);
		});

	let mapOldToNewNodeId = {};
	const nodes = origGroupNodes
		.map(function(node) {
			const newNode = createNode(node);
			mapOldToNewNodeId[node.id] = newNode.id;
			return newNode;
		});
	const nodeIds = nodes.map(R.prop('id'));
	group.nodeIds = nodeIds;

	const edges = graph.edges
		.filter(function(edge) {
			// of all edges return only those, where `from` and `to` are in original group
			return R.contains(edge.from, origGroupIds) ||
				R.contains(edge.to, origGroupIds);
		})
		.map(function(edge) {
			if (mapOldToNewNodeId[edge.from]) {
				edge = replaceIdInEdge(edge, edge.from, mapOldToNewNodeId[edge.from]);
			}
			if (mapOldToNewNodeId[edge.to]) {
				edge = replaceIdInEdge(edge, edge.to, mapOldToNewNodeId[edge.to]);
			}
			return createEdge(edge);
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
	fragment = prepareFragment(fragment); // TODO: is this needed?

	// add fragment; returns new graph
	return importModelFragment(graph, fragment, xy);
};


let addNode = // TODO: test
module.exports.addNode =
function addNode(graph, node) {
	node = _.defaults(node, { // TODO: createNode
		id: helpers.makeId('node'),
		label: 'new node'
	});
	graph.nodes.push(node);
	return graph;
};


let addNodeToGroup =
module.exports.addNodeToGroup =
function addNodeToGroup(graph, nodeId, groupId) {
	let group = helpers.getItemById(graph.groups, groupId);
	group.nodeIds.push(nodeId);
	group.nodeIds = R.uniq(group.nodeIds);
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
			return nodeId !== node.id;
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
function updateComponentProperties(graph, graphComponentType, componentId, newProperties) {
	let list = {
		'node': graph.nodes,
		'edge': graph.edges,
		'group': graph.groups,
	}[graphComponentType] || [];

	list = list.map(function(item) {
		if (item.id === componentId) {
			if (graphComponentType === 'edge') {
				newProperties.directed = // TODO: should this be here, or should Edge know how to draw different relations
					(R.contains((newProperties.relation || item.relation), nondirectedRelationTypes))
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

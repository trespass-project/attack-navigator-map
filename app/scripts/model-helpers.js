'use strict';

const _ = require('lodash');
const R = require('ramda');
const properCase = require('mout/string/properCase');
const trespass = require('trespass.js');
const helpers = require('./helpers.js');
const constants = require('./constants.js');


const modelComponents =
module.exports.modelComponents =
trespass.model.collectionNames;

const modelComponentsSingular =
module.exports.modelComponentsSingular =
trespass.model.collectionNamesSingular;

const nonDirectedRelationTypes =
module.exports.nonDirectedRelationTypes =
['network', 'connects'];

const nonGraphModelComponents =
module.exports.nonGraphModelComponents =
['predicates', 'policies', 'processes'];


const importModelFragment =
module.exports.importModelFragment =
function importModelFragment(currentGraph, fragment, xy={ x: 0, y: 0 }) {
	const graph = _.merge({}, currentGraph);

	const nodes = (fragment.nodes || [])
		.map((node, index) => {
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


const prepareFragment =
module.exports.prepareFragment =
function prepareFragment(fragment) {
	// let fragment = _.merge({}, fragment);

	(fragment.nodes || []).forEach((node, index) => {
		// TODO: id should be optional
		const oldId = node.id;

		// new id
		node.id = helpers.makeId('node');

		// rename existing ids in edges and groups
		if (oldId) {
			fragment.edges = (fragment.edges || []).map((_edge) => {
				let edge = createEdge(_edge); // new id
				edge = replaceIdInEdge(edge, oldId, node.id);
				return edge;
			});

			fragment.groups = (fragment.groups || []).map((_group) => {
				let group = createGroup(_group); // new id
				group.nodeIds = (group.nodeIds || []).map((nodeId) => {
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


const XMLModelToGraph =
module.exports.XMLModelToGraph =
function XMLModelToGraph(xmlStr, done) {
	// TODO: write test

	trespass.model.parse(xmlStr, (err, model) => {
		if (err) { return done(err); }

		const {graph, other, metadata} = graphFromModel(model);

		let colCounter = 0;
		let rowCounter = 0;
		let lastGroupIndex = 0;
		const maxNodesPerCol = 7;
		let isShifted = true;
		const spacing = 100;
		let xOffset = spacing / 2;
		const yOffset = spacing / 2;
		let groupIndex = -1;

		// create groups for the different types
		modelComponents
			.forEach((collectionName) => {
				const selection = graph.nodes
					.filter((node) => {
						return (node.modelComponentType === modelComponentsSingular[collectionName]);
					});

				if (!selection.length) {
					return;
				}

				const group = {
					name: collectionName,
					id: helpers.makeId('group'),
					nodeIds: []
				};
				groupIndex++;

				selection.forEach(function(node) {
					group.nodeIds.push(node.id);

					// basic auto-layout
					if (rowCounter > maxNodesPerCol || lastGroupIndex !== groupIndex) {
						if (lastGroupIndex !== groupIndex) {
							lastGroupIndex = groupIndex;
							isShifted = true;
							xOffset += spacing / 2;
						} else {
							isShifted = !isShifted;
						}

						rowCounter = 0;
						colCounter++;
					}
					node.label = node.id;
					node.modelComponentType = modelComponentsSingular[collectionName];
					node.x = xOffset + colCounter * spacing;
					node.y = yOffset + rowCounter * spacing + ((isShifted) ? 0 : 20);
					rowCounter++;
				});
				if (group.nodeIds.length) {
					graph.groups.push(group);
				}
			});

		done(null, {graph, other, metadata});
	});
};


const downloadAsXML =
module.exports.downloadAsXML =
function downloadAsXML(model, fileName='model.xml') {
	const xml = trespass.model.toXML(model);
	const blob = new Blob(
		[xml],
		{ type: 'text/plain;charset=utf-8' }
	);
	if (document) { // only in browser
		const saveAs = require('browser-saveas');
		saveAs(blob, fileName);
	}
	return blob;
};


const modelAsFragment =
module.exports.modelAsFragment =
function modelAsFragment(model) {
// TODO: this is not used
	return R.pick(modelComponents, model.system);
};


const graphFromModel =
module.exports.graphFromModel =
function graphFromModel(model) {
	let graph = {
		nodes: [],
		edges: [],
		groups: [],
	};

	// for each edge in model, create edge in graph
	graph.edges = model.system.edges
		.map(function(edge) {
			return {
				from: edge.source,
				to: edge.target,
				directed: edge.directed
			};
		});

	// set model component type
	R.without(['edges'], modelComponents)
		.forEach((collectionName) => {
			model.system[collectionName]
				.forEach((item) => {
					item.modelComponentType = modelComponentsSingular[collectionName];
				});
		});

	R.without(R.concat(['edges'], nonGraphModelComponents), modelComponents)
		.forEach(function(collectionName) {
			const coll = model.system[collectionName];
			graph.nodes = R.concat(graph.nodes, coll);
		});

	const other = nonGraphModelComponents
		.reduce((result, collectionName) => {
			result[collectionName] = model.system[collectionName];
			return result;
		}, {});

	// predicates
	other.predicates = other.predicates
		.reduce((result, item) => {
			item.value
				.forEach((value) => {
					const id = helpers.makeId(`${item.modelComponentType}-${item.id}`);
					result[id] = { id, value, label: item.id };
			});
			return result;
		}, {});

	const metadata = R.pick(trespass.model.knownAttributes.system, model.system);

	other.nodeNames = graph.nodes
		.map((item) => {
			const name = item.label || item.name || item.id; // TODO: figure this out
			return { name, label: name };
		});

	return {graph, other, metadata};
};


const modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph, metadata={}) {
	const model = trespass.model.create();

	// embed entire graph in model
	model.system.anm_data = JSON.stringify(graph);

	// include metadata
	model.system = _.merge(
		{},
		model.system,
		metadata
	);

	(graph.edges || []).forEach((edge) => {
		trespass.model.addEdge(model, {
			source: edge.from,
			target: edge.to,
			directed: edge.directed,
		});
	});

	(graph.nodes || []).forEach((node) => {
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
					'modelComponentType',
					'kbType'
				], node)
			);
		}
	});

	return model;
};


const removeGroup =
module.exports.removeGroup =
function removeGroup(graph, groupId, removeNodes=false) {
	graph.groups = graph.groups
		.filter((group) => {
			const keep = (groupId != group.id);
			if (!keep && removeNodes) {
				// remove nodes
				group.nodeIds.forEach((nodeId) => {
					removeNode(graph, nodeId);
				});
			}
			return keep;
		});
	return graph;
};


const createNode =
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

const createEdge = // TODO: test
module.exports.createEdge =
function createEdge(edge={}, keepId=false) {
	const id = (keepId === true && edge.id)
		? edge.id
		: helpers.makeId('edge');
	return _.merge({}, edge, { id });
};

const createGroup = // TODO: test
module.exports.createGroup =
function createGroup(group={}, keepId=false) {
	const id = (keepId === true && group.id)
		? group.id
		: helpers.makeId('group');
	return _.merge({}, group, {
		id
	});
};


const cloneNode =
module.exports.cloneNode =
function cloneNode(graph, origNode) {
	// duplicate node
	const nodes = [origNode] // new id + offset
		.map((node) => {
			return createNode(node);
		})
		.map((node) => {
			return _.merge({}, node, {
				x: node.x + constants.CLONE_OFFSET,
				y: node.y + constants.CLONE_OFFSET,
			});
		});
	const newNode = nodes[0];

	// also duplicate any existing edges
	const edges = graph.edges
		// find edges to / from original node
		.filter((edge) => {
			return R.contains(edge.from, [origNode.id]) || R.contains(edge.to, [origNode.id]);
		})
		// change reference to new node
		.map((_edge) => {
			let edge = createEdge(_edge);
			if (edge.from === origNode.id) { edge.from = newNode.id; }
			if (edge.to === origNode.id) { edge.to = newNode.id; }
			return edge;
		});

	// if node is in a group, so is the clone
	const groups = getNodeGroups(origNode.id, graph.groups);
	groups.forEach((group) => {
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


const replaceIdInEdge =
module.exports.replaceIdInEdge =
function replaceIdInEdge(_edge, oldId, newId) {
	const edge = _.merge({}, _edge);
	if (edge.from === oldId) {
		edge.from = newId;
	}
	if (edge.to === oldId) {
		edge.to = newId;
	}
	return edge;
};


// clone node, including edges
const nodeToFragment =
module.exports.nodeToFragment =
function nodeToFragment(graph, nodeId) {
	const node = helpers.getItemById(graph.nodes, nodeId);
	const edges = getNodeEdges(graph.edges, nodeId)
		.map((edge) => {
			return createEdge(edge);
		});
	return {
		edges,
		nodes: [createNode(node)]
	};
}


// clone group, including nodes and edges
const groupToFragment =
module.exports.groupToFragment =
function groupToFragment(graph, groupId) {
	const group = helpers.getItemById(graph.groups, groupId);
	const nodes = group.nodeIds
		.map((nodeId) => {
			const node = helpers.getItemById(graph.nodes, nodeId);
			return createNode(node);
		});
	const edges = group.nodeIds
		.reduce((acc, nodeId) => {
			const nodeEdges = getNodeEdges(graph.edges, nodeId);
			return acc.concat(nodeEdges);
		}, []);
	const uniqueEdges = R.uniqBy(R.prop('id'), edges)
		.map((edge) => {
			return createEdge(edge);
		});
	const newGroup = {
		id: helpers.makeId('group'),
		nodeIds: nodes.map(R.prop('id'))
	};
	return {
		nodes,
		edges: uniqueEdges,
		groups: [newGroup],
	};
}


const cloneGroup =
module.exports.cloneGroup =
function cloneGroup(graph, groupId) {
	let origGroup = helpers.getItemById(graph.groups, groupId);
	let group = _.merge({}, origGroup);

	// create fragment from group
	// TODO: use `groupToFragment()`
	const origGroupIds = group.nodeIds;
	const origGroupNodes = group.nodeIds
		.map((nodeId) => {
			// all nodes referenced in group
			return helpers.getItemById(graph.nodes, nodeId);
		});

	let mapOldToNewNodeId = {};
	const nodes = origGroupNodes
		.map((node) => {
			const newNode = createNode(node);
			mapOldToNewNodeId[node.id] = newNode.id;
			return newNode;
		});
	const nodeIds = nodes.map(R.prop('id'));
	group.nodeIds = nodeIds;

	const edges = graph.edges
		.filter((edge) => {
			// of all edges return only those, where `from` and `to` are in original group
			return R.contains(edge.from, origGroupIds) ||
				R.contains(edge.to, origGroupIds);
		})
		.map((edge) => {
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


const addNodeToGroup =
module.exports.addNodeToGroup =
function addNodeToGroup(graph, nodeId, groupId) {
	const group = helpers.getItemById(graph.groups, groupId);
	group.nodeIds.push(nodeId);
	group.nodeIds = R.uniq(group.nodeIds);
	return graph;
};


const getNodeGroups =
module.exports.getNodeGroups =
function getNodeGroups(nodeId, groups) {
	return groups
		.filter((group) => {
			return R.contains(nodeId, group.nodeIds);
		});
};


const getNodeEdges =
module.exports.getNodeEdges =
function getNodeEdges(edges, nodeId) {
	return edges
		.filter((edge) => {
			return (edge.from === nodeId || edge.to === nodeId);
		});
};


const getEdgeNodes =
module.exports.getEdgeNodes =
function getEdgeNodes(edge, nodes) {
	const edgeNodes = {
		fromNode: helpers.getItemById(nodes, edge.from),
		toNode: helpers.getItemById(nodes, edge.to),
	};
	return edgeNodes;
};


const inferEdgeType =
module.exports.inferEdgeType =
function inferEdgeType(fromType, toType) {
	if (fromType === 'location' && toType === 'location') {
		return 'connection';
		// TODO: or should it return all possible options, like
		// ['connection', 'isContainedIn']? (directed-ness could play a role)
	} else if (fromType === 'item' && toType === 'item') {
		return 'networkConnection';
	} else if (fromType === 'item' && toType === 'location') { // TODO: is that always the case?
		return 'atLocation';
	} else {
		return undefined;
	}
};


const removeNode =
module.exports.removeNode =
function removeNode(graph, nodeId) {
	// remove node
	graph.nodes = graph.nodes
		.filter((node) => {
			return nodeId !== node.id;
		});

	// and also all edges connected to it
	graph.edges = graph.edges
		.filter((edge) => {
			return (edge.from !== nodeId) && (edge.to !== nodeId);
		});

	// remove from groups
	graph.groups
		.forEach((group) => {
			group.nodeIds = group.nodeIds
				.filter((groupNodeId) => {
					return groupNodeId !== nodeId;
				});
		});
	return graph;
};


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(graph, graphComponentType, componentId, newProperties) {
	let list = {
		'node': graph.nodes,
		'edge': graph.edges,
		'group': graph.groups,
	}[graphComponentType] || [];

	list = list.map((item) => {
		if (item.id === componentId) {
			if (graphComponentType === 'edge') {
				newProperties.directed = // TODO: should this be here, or should Edge know how to draw different relations
					(R.contains((newProperties.relation || item.relation), nonDirectedRelationTypes))
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

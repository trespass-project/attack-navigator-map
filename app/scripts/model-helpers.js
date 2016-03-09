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

const origin = { x: 0, y: 0 };


const createFragment =
module.exports.createFragment =
function createFragment(data={}) {
	return _.defaults(
		data,
		{
			nodes: [],
			edges: [],
			groups: []
		}
	);
}


const _duplicate =
module.exports._duplicate =
function _duplicate(it={}, defaults, keepId=false, itsType) {
	const id = (it.id && keepId === true)
		? it.id
		: helpers.makeId(itsType);
	return _.defaults(
		_.merge({}, it, { id }),
		defaults
	);
};


const duplicateNode =
module.exports.duplicateNode =
function duplicateNode(node={}, keepId=false) {
	const defaults = { x: 0, y: 0, };
	return _duplicate(node, defaults, keepId, 'node');
};


const duplicateEdge =
module.exports.duplicateEdge =
function duplicateEdge(edge={}, keepId=false) {
	const defaults = {};
	return _duplicate(edge, defaults, keepId, 'edge');
};


const duplicateGroup =
module.exports.duplicateGroup =
function duplicateGroup(group={}, keepId=false) {
	const defaults = {
		nodeIds: []
	};
	return _duplicate(group, defaults, keepId, 'group');
};


const nodeAsFragment =
module.exports.nodeAsFragment =
function nodeAsFragment(node) {
	return createFragment({ nodes: [node] });
};


const nodeAsFragmentInclEdges =
module.exports.nodeAsFragmentInclEdges =
function nodeAsFragmentInclEdges(node, edges) {
	return createFragment({
		edges: getNodeEdges(edges, node.id),
		nodes: [node]
	});
};


const edgeAsFragment =
module.exports.edgeAsFragment =
function edgeAsFragment(edge) {
	return createFragment({ edges: [edge] });
};


const edgeAsFragmentInclNodes =
module.exports.edgeAsFragmentInclNodes =
function edgeAsFragmentInclNodes(edge, nodes) {
	const {fromNode, toNode} = getEdgeNodes(edge, nodes);
	return createFragment({
		edges: [edge],
		nodes: [fromNode, toNode]
	});
};


const groupAsFragment =
module.exports.groupAsFragment =
function groupAsFragment(graph, group) {
	const nodes = getGroupNodes(graph, group);

	const edges = group.nodeIds
		.reduce((acc, nodeId) => {
			const nodeEdges = getNodeEdges(graph.edges, nodeId);
			return acc.concat(nodeEdges);
		}, []);
	const uniqueEdges = R.uniqBy(R.prop('id'), edges);

	return createFragment({
		nodes,
		edges: uniqueEdges,
		groups: [group],
	});
};


const replaceIdInGroup =
module.exports.replaceIdInGroup =
function replaceIdInGroup(mapping, group) {
	group.nodeIds = (group.nodeIds || [])
		.map((nodeId) => {
			return (mapping[nodeId] || nodeId);
		});
	return group;
};


const replaceIdInEdge =
module.exports.replaceIdInEdge =
function replaceIdInEdge(mapping, edge) {
	const oldIds = R.keys(mapping);
	if (R.contains(edge.from, oldIds)) {
		edge.from = mapping[edge.from];
	}
	if (R.contains(edge.to, oldIds)) {
		edge.to = mapping[edge.to];
	}
	return edge;
};


/*
deeply clones a fragment, and creates new ids for everything inside.
→ returns a new fragment
*/
const duplicateFragment =
module.exports.duplicateFragment =
function duplicateFragment(_fragment) {
	const fragment = _.merge({}, _fragment);

	const oldToNewNodeId = {};
	fragment.nodes = (fragment.nodes || [])
		.map((_node) => {
			const node = duplicateNode(_node);
			oldToNewNodeId[_node.id] = node.id;
			return node;
		});

	fragment.edges = (fragment.edges || [])
		.map((_edge) => {
			const edge = duplicateEdge(_edge);
			return replaceIdInEdge(oldToNewNodeId, edge);
		});

	fragment.groups = (fragment.groups || [])
		.map((_group) => {
			const group = duplicateGroup(_group);
			return replaceIdInGroup(oldToNewNodeId, group);
		});

	return fragment;
};


const combineFragments =
module.exports.combineFragments =
function combineFragments(fragments) {
	return fragments
		.reduce((acc, fragment) => {
			acc.nodes = acc.nodes.concat(fragment.nodes || []);
			acc.edges = acc.edges.concat(fragment.edges || []);
			acc.groups = acc.groups.concat(fragment.groups || []);
			return acc;
		}, createFragment());
};


const importFragment =
module.exports.importFragment =
function importFragment(graph, fragment, atXY=origin) {
	// offset nodes
	const xOffset = 60;
	const yOffset = 30;
	fragment.nodes = fragment.nodes
		.map((node, index) => {
			node.x = atXY.x + (node.x || index * xOffset)
			node.y = atXY.y + (node.y || index * yOffset)
			return node;
		});

	const combined = combineFragments([graph, fragment]);
	return combined;
};


const XMLModelToGraph = // TODO: test
module.exports.XMLModelToGraph =
function XMLModelToGraph(xmlStr, done) {
	trespass.model.parse(xmlStr, (err, model) => {
		if (err) { return done(err); }
		const {graph, other} = graphFromModel(model);
		done(null, graph, other);
	});
};


const layoutGraphByType = // TODO: test
module.exports.layoutGraphByType =
function layoutGraphByType(graph) {
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

			const group = duplicateGroup({
				name: collectionName,
			});
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


const graphFromModel =
module.exports.graphFromModel =
function graphFromModel(model) {
	const graph = createFragment();

	// for each edge in model, create edge in graph
	graph.edges = model.system.edges
		.map((edge) => {
			return duplicateEdge({
				from: edge.source,
				to: edge.target,
				directed: edge.directed
			});
		});

	// set model component type
	R.without(['edges'], modelComponents)
		.forEach((collectionName) => {
			model.system[collectionName]
				.forEach((item) => {
					item.modelComponentType = modelComponentsSingular[collectionName];
				});
		});

	const nonGraphComponents = R.concat(['edges'], nonGraphModelComponents);
	R.without(nonGraphComponents, modelComponents)
		.forEach((collectionName) => {
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
			item.value.forEach((value) => {
				result.push({
					id: item.id,
					value
				});
			});
			return result;
		}, []);

	other.modelId = model.system.id;

	return {graph, other};
};


const modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph) {
	const model = trespass.model.create();

	// embed entire graph in model
	model.system.anm_data = JSON.stringify(graph);

	(graph.edges || []).forEach((edge) => {
		trespass.model.addEdge(model, {
			source: edge.from,
			target: edge.to,
			directed: edge.directed,
		});
	});

	(graph.nodes || []).forEach((node) => {
		const type = node.modelComponentType;
		const fnName = `add${properCase(type)}`;
		const addFn = trespass.model[fnName];
		if (!addFn) {
			console.warn(`${fnName}()`, 'not found');
		} else {
			const keysToOmit = [
				/*'name', */
				'label',
				'x',
				'y',
				'modelComponentType',
				'kbType'
			];
			addFn(model, R.omit(keysToOmit, node));
		}
	});

	return model;
};


const removeGroup =
module.exports.removeGroup =
function removeGroup(graph, groupId, removeNodes=false) {
	graph.groups = graph.groups
		.filter((group) => {
			const keep = (groupId !== group.id);
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


const cloneNode =
module.exports.cloneNode =
function cloneNode(graph, origNodeId) {
	const origNode = helpers.getItemById(graph.nodes, origNodeId);

	const _fragment = nodeAsFragmentInclEdges(origNode, graph.edges);
	const fragment = duplicateFragment(_fragment);
	const newNodeId = fragment.nodes[0].id;

	// if node is in a group, so is the clone
	const groups = getNodeGroups(origNode.id, graph.groups);
	groups.forEach((group) => {
		group.nodeIds = [...group.nodeIds, newNodeId];
	});

	// add fragment
	return importFragment(graph, fragment/*, xy*/);
};


const cloneGroup =
module.exports.cloneGroup =
function cloneGroup(graph, groupId) {
	const origGroup = helpers.getItemById(graph.groups, groupId);

	const _fragment = groupAsFragment(graph, origGroup);
	const fragment = duplicateFragment(_fragment);

	const xy = {
		x: constants.CLONE_OFFSET,
		y: constants.CLONE_OFFSET,
	};

	// add fragment; returns new graph
	return importFragment(graph, fragment, xy);
};


const addNode = // TODO: test
module.exports.addNode =
function addNode(graph, node) {
	node = _.defaults(node, { // TODO: createNode
		id: helpers.makeId('node'),
		label: 'new node'
	});
	graph.nodes.push(node);
	return graph;
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
			return R.contains(nodeId, [edge.from, edge.to]);
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


const getGroupNodes =
module.exports.getGroupNodes =
function getGroupNodes(graph, group) {
	return group.nodeIds
		.map((nodeId) => {
			return helpers.getItemById(graph.nodes, nodeId);
		});
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

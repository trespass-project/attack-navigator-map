'use strict';

const update = require('react-addons-update');
const _ = require('lodash');
const R = require('ramda');
const properCase = require('mout/string/properCase');
const trespass = require('trespass.js');
const helpers = require('./helpers.js');
const constants = require('./constants.js');


const collectionNames =
module.exports.collectionNames =
trespass.model.collectionNames;

const collectionNamesSingular =
module.exports.collectionNamesSingular =
trespass.model.collectionNamesSingular;

const nonDirectedRelationTypes =
module.exports.nonDirectedRelationTypes =
['network', 'connects', undefined];

const nonEdgeRelationTypes =
module.exports.nonEdgeRelationTypes =
['network', 'connects', undefined];

const nonGraphCollectionNames =
module.exports.nonGraphCollectionNames =
['predicates', 'policies', 'processes'];

const graphComponentSingular =
module.exports.graphComponentSingular = {
	'nodes': 'node',
	'edges': 'edge',
	'groups': 'group',
};

const graphComponentPlural =
module.exports.graphComponentPlural =
R.invertObj(graphComponentSingular);

const origin = { x: 0, y: 0 };


const createFragment =
module.exports.createFragment =
function createFragment(data={}) {
	return _.defaults(
		data,
		{
			nodes: {},
			edges: {},
			groups: {},
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
		nodeIds: [],
		label: 'new group',
	};
	return _duplicate(group, defaults, keepId, 'group');
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
	fragment.nodes = R.values(fragment.nodes || {})
		.reduce((acc, _node) => {
			const node = duplicateNode(_node);
			acc[node.id] = node;
			oldToNewNodeId[_node.id] = node.id;
			return acc;
		}, {});

	fragment.edges = R.values(fragment.edges || {})
		.reduce((acc, _edge) => {
			const edge = duplicateEdge(_edge);
			replaceIdInEdge(oldToNewNodeId, edge);
			acc[edge.id] = edge;
			return acc;
		}, {});

	fragment.groups = R.values(fragment.groups || {})
		.reduce((acc, _group) => {
			const group = duplicateGroup(_group);
			replaceIdInGroup(oldToNewNodeId, group);
			acc[group.id] = group;
			return acc;
		}, {});

	return fragment;
};


const nodeAsFragment =
module.exports.nodeAsFragment =
function nodeAsFragment(node) {
	return createFragment({
		nodes: helpers.toHashMap('id', [node])
	});
};


const nodeAsFragmentInclEdges =
module.exports.nodeAsFragmentInclEdges =
function nodeAsFragmentInclEdges(node, edges) {
	const nodeFragment = nodeAsFragment(node);
	const nodeEdges = getNodeEdges(node, edges)
	const edgesFragment = createFragment({
		edges: helpers.toHashMap('id', nodeEdges)
	});
	return combineFragments([nodeFragment, edgesFragment]);
};


const edgeAsFragment =
module.exports.edgeAsFragment =
function edgeAsFragment(edge) {
	return createFragment({
		edges: helpers.toHashMap('id', [edge])
	});
};


const edgeAsFragmentInclNodes =
module.exports.edgeAsFragmentInclNodes =
function edgeAsFragmentInclNodes(edge, nodes) {
	const edgeFragment = edgeAsFragment(edge);
	const {fromNode, toNode} = getEdgeNodes(edge, nodes);
	const nodesFragment = createFragment({
		nodes: helpers.toHashMap('id', [fromNode, toNode])
	});
	return combineFragments([edgeFragment, nodesFragment]);
};


const groupAsFragment =
module.exports.groupAsFragment =
function groupAsFragment(graph, group) {
	const nodes = getGroupNodes(group, graph.nodes);

	const edges = group.nodeIds
		.reduce((acc, nodeId) => {
			const node = graph.nodes[nodeId];
			const nodeEdges = getNodeEdges(node, graph.edges);
			return acc.concat(nodeEdges);
		}, []);

	return createFragment({
		nodes: helpers.toHashMap('id', nodes),
		edges: helpers.toHashMap('id', edges),
		groups: helpers.toHashMap('id', [group]),
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


const combineFragments =
module.exports.combineFragments =
function combineFragments(fragments) {
	return fragments
		.reduce((acc, fragment) => {
			return update(
				acc,
				{
					nodes: { $merge: (fragment.nodes || {}) },
					edges: { $merge: (fragment.edges || {}) },
					groups: { $merge: (fragment.groups || {}) },
				}
			);
		}, createFragment());
};


const importFragment =
module.exports.importFragment =
function importFragment(graph, fragment, atXY=origin) {
	// TODO:
	R.keys(fragment)
		.forEach((key) => {
			const item = fragment[key];
			if (_.isArray(item)) {
				fragment[key] = helpers.toHashMap('id', item);
			}
		});

	function offsetNodes(nodes) {
		const xOffset = 60;
		const yOffset = 30;
		return R.values(nodes)
			.reduce((acc, node, index) => {
				const coords = {
					x: atXY.x + (node.x || index * xOffset),
					y: atXY.y + (node.y || index * yOffset),
				};
				acc[node.id] = update(node, { $merge: coords });
				return acc;
			}, {});
	}

	return combineFragments([
		graph,
		update(fragment, { nodes: { $apply: offsetNodes } })
	]);
};


const XMLModelToGraph = // TODO: test
module.exports.XMLModelToGraph =
function XMLModelToGraph(xmlStr, done) {
	trespass.model.parse(xmlStr, (err, model) => {
		if (err) { return done(err); }
		done(null, graphFromModel(model));
	});
};


const layoutGraphByType =
module.exports.layoutGraphByType =
function layoutGraphByType(_graph) {
	let graph = update(
		createFragment(),
		{ $merge: _graph }
	);

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
	collectionNames
		.forEach((collectionName) => {
			const selection = R.values(graph.nodes)
				.filter((node) => {
					return (node.modelComponentType === collectionNamesSingular[collectionName]);
				});

			if (!selection.length) {
				return;
			}

			const group = duplicateGroup({
				label: collectionName,
			});
			groupIndex++;

			selection.forEach((node) => {
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
				node.modelComponentType = collectionNamesSingular[collectionName];
				node.x = xOffset + colCounter * spacing;
				node.y = yOffset + rowCounter * spacing + ((isShifted) ? 0 : 20);
				rowCounter++;
			});

			if (group.nodeIds.length) {
				const setGroup = { $set: group };
				graph = update(graph, { groups: { [group.id]: setGroup } });
			}
		});

	return graph;
};


const graphFromModel =
module.exports.graphFromModel =
function graphFromModel(model) {
	let graph = createFragment();

	// for each edge in model, create edge in graph
	const edges = model.system.edges
		.map((edge) => {
			return duplicateEdge({
				from: edge.source,
				to: edge.target,
				directed: edge.directed,
				// TODO: infer type?
			});
		});

	// set model component type
	const nonEdges = R.without(['edges'], collectionNames);
	nonEdges
		.forEach((collectionName) => {
			model.system[collectionName]
				.forEach((item) => {
					item.modelComponentType = collectionNamesSingular[collectionName];
				});
		});

	const nonGraphComponents = [...nonGraphCollectionNames, 'edges'];
	R.without(nonGraphComponents, collectionNames)
		.forEach((collectionName) => {
			// TODO: warn or s.th.
			const coll = (_.isArray(model.system[collectionName]))
				? helpers.toHashMap('id', model.system[collectionName])
				: model.system[collectionName];

			// convert atLocations to edges:
			R.values(coll)
				.forEach((item) => {
					(item.atLocations || [])
						.forEach((loc) => {
							const edge = duplicateEdge({
								from: item.id,
								to: loc,
								directed: true,
								relation: 'atLocation'
							});
							edges.push(edge);
						});
					delete item.atLocations;
				});

			graph = update(graph, { nodes: { $merge: coll } });
		});

	const other = nonGraphCollectionNames
		.reduce((result, collectionName) => {
			result[collectionName] = model.system[collectionName];
			return result;
		}, {});

	// predicates
	other.predicates = other.predicates
		.reduce((result, predicate) => {
			predicate.value
				.forEach((value) => {
					result.push({ id: predicate.id, value });
				});
			return result;
		}, []);

	graph.edges = helpers.toHashMap('id', edges);

	const metadata = R.pick(trespass.model.knownAttributes.system, model.system);

	return {graph, other, metadata};
};


const relationConvertsToEdge =
module.exports.relationConvertsToEdge =
function relationConvertsToEdge(relation) {
	return R.contains(relation, nonEdgeRelationTypes);
};


const modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph, metadata={}) {
	if (_.isEmpty(metadata)) {
		console.warn('metadata missing');
	}

	const model = trespass.model.create();

	// embed entire graph in model
	model.system.anm_data = JSON.stringify(graph);

	// include metadata
	model.system = _.merge(
		{},
		model.system,
		metadata
	);

	R.values(graph.edges || {})
		.forEach((edge) => {
			const isDirected = !R.contains(edge.relation, nonDirectedRelationTypes);
			if (relationConvertsToEdge(edge.relation)) {
				trespass.model.addEdge(model, {
					source: edge.from,
					target: edge.to,
					directed: /*edge.directed*/ isDirected,
					kind: edge.relation,
				});
			} else {
				if (edge.relation === 'atLocation') {
					const fromNode = graph.nodes[edge.from];
					if (!fromNode.atLocations) {
						fromNode.atLocations = [];
					}
					fromNode.atLocations = [...fromNode.atLocations, edge.to];
				} else {
					// TODO: what else could there be?
				}
			}
		});

	const keysToOmit = [
		/*'name', */
		'label',
		'x',
		'y',
		'modelComponentType',
		// 'type' // knowledgebase type
	];
	const re = new RegExp('^tkb:', 'i');
	R.values(graph.nodes || {})
		.forEach((node) => {
			const type = node.modelComponentType;
			const fnName = `add${properCase(type)}`;
			const addFn = trespass.model[fnName];
			if (!addFn) {
				console.warn(`${fnName}()`, 'not found');
			} else {
				let item = R.omit(keysToOmit, node);
				// also remove all kb stuff
				item = R.pickBy(
					(value, key) => !re.test(key),
					item
				);
				if (node.label) {
					item.name = node.label;
				}
				addFn(model, item);
			}
		});

	return model;
};


const removeNode =
module.exports.removeNode =
function removeNode(graph, nodeId) {
	// remove node
	const node = graph.nodes[nodeId];
	const updateNodes = { nodes: { $set: R.omit([nodeId], graph.nodes) } };

	// and also all edges connected to it
	const nodeEdgesIds = getNodeEdges(node, graph.edges)
		.map(item => item.id);
	const updateEdges = { edges: { $set: R.omit(nodeEdgesIds, graph.edges) } };

	// remove from groups
	const nodeGroups = getNodeGroups(node, graph.groups);
	const updateGroupsNodeIds = nodeGroups
		.reduce((acc, group) => {
			acc[group.id] = { nodeIds: { $set: R.without([nodeId], group.nodeIds) } }
			return acc;
		}, {});
	const updateGroups = { groups: updateGroupsNodeIds };

	return update(
		graph,
		_.assign({}, updateNodes, updateEdges, updateGroups)
	);
};


const addEdge = // TODO: test
module.exports.addEdge =
function addEdge(graph, _edge) {
	const edge = duplicateEdge(_edge);
	return update(
		graph,
		{ edges: { [edge.id]: { $set: edge } } }
	);
};


const removeEdge = // TODO: test
module.exports.removeEdge =
function removeEdge(graph, edgeId) {
	const without = R.omit([edgeId], graph.edges);
	return update(
		graph,
		{ edges: { $set: without } }
	);
};


const addGroup = // TODO: test
module.exports.addGroup =
function addGroup(graph, _group) {
	const group = duplicateGroup(_group);
	return update(
		graph,
		{ groups: { [group.id]: { $set: group } } }
	);
};


const moveGroup = // TODO: test
module.exports.moveGroup =
function moveGroup(graph, groupId, deltaXY) {
	const group = graph.groups[groupId];

	const updateNodes = group.nodeIds
		.reduce((acc, id) => {
			const node = graph.nodes[id];
			const coords = {
				x: node.x + deltaXY.x,
				y: node.y + deltaXY.y,
			}
			acc[id] = { $merge: coords };
			return acc;
		}, {});

	return update(
		graph,
		{ nodes: updateNodes }
	);
};


const removeGroup =
module.exports.removeGroup =
function removeGroup(graph, groupId, removeNodes=false) {
	const group = graph.groups[groupId];

	const g = (!removeNodes)
		? graph
		: group.nodeIds
			.reduce((graph, nodeId) => {
				return removeNode(graph, nodeId);
			}, graph);

	const newGroups = R.omit([groupId], g.groups);
	return update(g, { groups: { $set: newGroups } });
};


const cloneNode =
module.exports.cloneNode =
function cloneNode(graph, origNodeId) {
	const origNode = graph.nodes[origNodeId];

	const fragment = duplicateFragment(
		nodeAsFragmentInclEdges(origNode, graph.edges)
	);
	const newNode = R.values(fragment.nodes)[0];

	// if node is in a group, so is the clone
	const nodeGroups = getNodeGroups(origNode, graph.groups);
	const g = nodeGroups
		.reduce((graph, group) => {
			const pushNewNode = { $push: [newNode.id] };
			return update(graph, { groups: { [group.id]: { nodeIds: pushNewNode } } });
		}, graph);

	const xy = {
		x: constants.CLONE_OFFSET,
		y: constants.CLONE_OFFSET,
	};

	// add fragment
	return importFragment(g, fragment, xy);
};


const cloneGroup =
module.exports.cloneGroup =
function cloneGroup(graph, groupId) {
	const origGroup = graph.groups[groupId];

	const fragment = duplicateFragment(
		groupAsFragment(graph, origGroup)
	);

	const xy = {
		x: constants.CLONE_OFFSET,
		y: constants.CLONE_OFFSET,
	};

	// add fragment; returns new graph
	return importFragment(graph, fragment, xy);
};


const addGroupBackgroundImage = // TODO: test
module.exports.addGroupBackgroundImage =
function addGroupBackgroundImage(graph, groupId, dataURI, aspectRatio) {
	const _bgImage = {
		aspectRatio,
		url: dataURI,
		width: 550,
		height: 550 / aspectRatio,
	};
	return update(
		graph,
		{ groups: { [groupId]: { _bgImage: { $set: _bgImage } } } }
	);
};


const removeGroupBackgroundImage = // TODO: test
module.exports.removeGroupBackgroundImage =
function removeGroupBackgroundImage(graph, groupId) {
	const group = graph.groups[groupId];
	const newGroup = R.omit(['_bgImage'], group);
	return update(
		graph,
		{ groups: { [groupId]: { $set: newGroup } } }
	);
};


const resizeGroupBackgroundImage = // TODO: test
module.exports.resizeGroupBackgroundImage =
function resizeGroupBackgroundImage(graph, groupId, width, height) {
	const group = graph.groups[groupId];
	if (!group._bgImage) {
		return graph;
	}

	const _bgImage = { width, height };
	return update(
		graph,
		{ groups: { [groupId]: { _bgImage: { $merge: _bgImage } } } }
	);
};


const moveGroupBackgroundImage = // TODO: test
module.exports.moveGroupBackgroundImage =
function moveGroupBackgroundImage(graph, groupId, groupCenterOffsetXY) {
	const group = graph.groups[groupId];
	if (!group._bgImage) {
		return graph;
	}

	const _bgImage = {
		groupCenterOffsetX: groupCenterOffsetXY.x,
		groupCenterOffsetY: groupCenterOffsetXY.y,
	};
	return update(
		graph,
		{ groups: { [groupId]: { _bgImage: { $merge: _bgImage } } } }
	);
};


const addNodeToGroup =
module.exports.addNodeToGroup =
function addNodeToGroup(graph, nodeId, groupId) {
	const group = graph.groups[groupId];
	const newNodeIds = R.uniq([...group.nodeIds, nodeId]);
	return update(
		graph,
		{ groups: { [groupId]: { nodeIds: { $set: newNodeIds } } } }
	);
};


const moveNode = // TODO: test
module.exports.moveNode =
function moveNode(graph, nodeId, xy) {
	return update(
		graph,
		{ nodes: { [nodeId]: { $merge: xy } } }
	);
};


const ungroupNode = // TODO: test
module.exports.ungroupNode =
function ungroupNode(graph, nodeId) {
	const groups = R.values(graph.groups);
	const updateGroups = groups
		.reduce((acc, group) => {
			if (R.contains(nodeId, group.nodeIds)) {
				const newNodeIds = R.without([nodeId], group.nodeIds);
				acc[group.id] = { nodeIds: { $set: newNodeIds } }
			}
			return acc;
		}, {});

	return update(
		graph,
		{ groups: updateGroups }
	);
};


const getNodeGroups =
module.exports.getNodeGroups =
function getNodeGroups(node, groupsMap) {
	return R.values(groupsMap)
		.filter((group) => {
			return R.contains(node.id, group.nodeIds);
		});
};


const getNodeEdges =
module.exports.getNodeEdges =
function getNodeEdges(node, edgesMap) {
	return R.values(edgesMap)
		.filter((edge) => {
			return R.contains(node.id, [edge.from, edge.to]);
		});
};


const getEdgeNodes =
module.exports.getEdgeNodes =
function getEdgeNodes(edge, nodesMap) {
	const edgeNodes = {
		fromNode: nodesMap[edge.from],
		toNode: nodesMap[edge.to],
	};
	return edgeNodes;
};


const getGroupNodes =
module.exports.getGroupNodes =
function getGroupNodes(group, nodesMap) {
	return group.nodeIds
		.map(nodeId => nodesMap[nodeId]);
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


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(graph, graphComponentType, componentId, newProperties) {
	const collectionName = graphComponentPlural[graphComponentType];
	const item = graph[collectionName][componentId];
	const updatedItem = update(item, { $merge: newProperties });

	let g = graph;
	if (item.id !== updatedItem.id) {
		const withoutOldId = R.omit([item.id], graph[collectionName]);
		g = update(
			graph,
			{ [collectionName]: { $set: withoutOldId } }
		);
	}

	g = update(
		g,
		{ [collectionName]: { [updatedItem.id]: { $set: updatedItem } } }
	);

	return g;
};

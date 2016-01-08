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
	'assets',
	'actors',
	'roles',
	'predicates',
	'processes',
	'policies'
];


let importModelFragment =
module.exports.importModelFragment =
function importModelFragment(currentGraph, fragment, xy={ x: 0, y: 0 }) {
	let graph = _.merge({}, currentGraph);

	const nodes = (fragment.nodes || [])
		.map(function(node, index) {
			return _.merge({}, node, {
				x: xy.x + (node.x || index * 60),
				y: xy.y + (node.y || index * 30)
			});
		});
	graph.nodes = graph.nodes.concat(nodes);

	const groups = (fragment.groups || []);
	graph.groups = graph.groups.concat(groups);

	const edges = (fragment.edges || []);
	graph.edges = graph.edges.concat(edges);

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


let XMLModelToObject =
module.exports.XMLModelToObject =
function XMLModelToObject(xml) {
	const $system = trespass.model.parse(xml)('system');
	const model = trespass.model.prepare($system);

	// generate graph from model
	let graph = {
		nodes: [],
		edges: [],
		groups: [],
	};

	// for each edge in model, create edge in graph
	graph.edges = model.system.edges.map(function(edge) {
		edge = edge.edge;
		return {
			from: edge.source,
			to: edge.target,
			relation: edge._relation,
			directed: edge.directed,
		};
	});

	// for each location in model, create node
	let locationsGroup = {
		name: 'locations', // TODO: should be `label`
		id: 'locations',
		nodeIds: []
	};
	let locations = model.system.locations.map(function(location) {
		location = location.location;
		locationsGroup.nodeIds.push(location.id);
		return {
			type: 'location',
			label: location.label || location.id || 'untitled',
			value: location.id,
			id: location.id,
			domain: location.domain,
			x: 200,
			y: 200,
		};
	});
	graph.nodes = R.concat(graph.nodes, locations);
	if (locationsGroup.nodeIds.length) { graph.groups.push(locationsGroup); }

	let assetsGroup = {
		name: 'assets',
		id: 'assets',
		nodeIds: []
	};
	let assets = model.system.assets.map(function(asset) {
		asset = asset.asset;
		assetsGroup.nodeIds.push(asset.id);
		return {
			type: 'asset',
			label: asset.label || asset.id || 'untitled',
			value: asset.id,
			id: asset.id,
			x: 400,
			y: 200,
		};
	});
	graph.nodes = R.concat(graph.nodes, assets);
	if (assetsGroup.nodeIds.length) { graph.groups.push(assetsGroup); }

	let actorsGroup = {
		name: 'actors',
		id: 'actors',
		nodeIds: []
	};
	let actors = model.system.actors.map(function(actor) {
		actor = actor.actor;
		actorsGroup.nodeIds.push(actor.id);
		return {
			type: 'actor',
			label: actor.label || actor.id || 'untitled',
			value: actor.id,
			id: actor.id,
			x: 400,
			y: 400,
		};
	});
	graph.nodes = R.concat(graph.nodes, actors);
	if (actorsGroup.nodeIds.length) { graph.groups.push(actorsGroup); }

	let rolesGroup = {
		name: 'roles',
		id: 'roles',
		nodeIds: []
	};
	let roles = model.system.roles.map(function(role) {
		role = role.role;
		rolesGroup.nodeIds.push(role.id);
		return {
			type: 'role',
			label: role.label || role.id || 'untitled',
			value: role.id,
			id: role.id,
			x: 600,
			y: 200,
		};
	});
	graph.nodes = R.concat(graph.nodes, roles);
	if (rolesGroup.nodeIds.length) { graph.groups.push(rolesGroup); }

	let predicatesGroup = {
		name: 'predicates',
		id: 'predicates',
		nodeIds: []
	};
	let predicates = model.system.predicates.map(function(predicate) {
		predicate = predicate.predicate;
		predicatesGroup.nodeIds.push(predicate.id);
		return {
			type: 'predicate',
			label: predicate.label || predicate.id || 'untitled',
			value: predicate.id,
			id: predicate.id,
			x: 600,
			y: 400,
		};
	});
	graph.nodes = R.concat(graph.nodes, predicates);
	if (predicatesGroup.nodeIds.length) { graph.groups.push(predicatesGroup); }

	let processesGroup = {
		name: 'processs',
		id: 'processs',
		nodeIds: []
	};
	let processes = model.system.processes.map(function(process) {
		process = process.process;
		processesGroup.nodeIds.push(process.id);
		return {
			type: 'process',
			label: process.label || process.id || 'untitled',
			value: process.id,
			id: process.id,
			x: 600,
			y: 600,
		};
	});
	graph.nodes = R.concat(graph.nodes, processes);
	if (processesGroup.nodeIds.length) { graph.groups.push(processesGroup); }

	let policiesGroup = {
		name: 'policies',
		id: 'policies',
		nodeIds: []
	};
	let policies = model.system.policies.map(function(policy) {
		policy = policy.policy;
		policiesGroup.nodeIds.push(policy.id);
		return {
			type: 'policy',
			label: policy.label || policy.id || 'untitled',
			value: policy.id,
			id: policy.id,
			x: 600,
			y: 200,
		};
	});
	graph.nodes = R.concat(graph.nodes, policies);
	if (policiesGroup.nodeIds.length) { graph.groups.push(policiesGroup); }
	// TODO: refine, generalize, ...

	return graph;
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


function createNode(node={}) {
	return _.merge({}, node, {
		x: (node.x || 0),
		y: (node.y || 0),
	});
}
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
		.map(createNode)
		.map(function(node) { // new id + offset
			return _.merge(node, {
				id: helpers.makeId('node'),
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

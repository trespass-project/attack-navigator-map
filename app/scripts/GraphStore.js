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

	loadModel(action) {
		var that = this;

		that.setState({
			loading: true,
			error: null
		});

		action.promise
			.success(function(data, status, jqXHR) {
				that.loadXML({data});
			})
			.error(function(jqXHR, status, errorMessage) {
				console.error(status, errorMessage);
				that.setState({
					error: {
						status,
						errorMessage
					}
				});
			})
			.always(function() {
				that.setState({ loading: false });
			});
	}

	loadXML(action) {
		const {content} = action;
		var $system = trespass.model.parse(content)('system');
		var model = trespass.model.prepare($system);

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

		this.setState({
			model: model,
			graph: graph
		});
	}

	modelAdd(action) {
		const {type, data} = action;
		let method = 'add' + mout.string.pascalCase(type);
		if (!mout.object.has(trespass.model, method)) {
			method = 'add_';
		}
		let model = trespass.model[method](this.state.model, data);
		this.setState({ model: model });
	}

	cloneGroup(action) {
		const that = this;

		let {group} = action;
		group = _.merge({}, group);

		// create fragment from group
		const groupNodes = group.nodeIds.map(function(nodeId) {
			// all nodes referenced in group
			return helpers.getItemById(that.state.graph.nodes, nodeId);
		});
		const nodes = groupNodes.map(function(node) {
			let newNode = _.merge({}, node);
			newNode.x = node.x + 100;
			newNode.y = node.y + 100;
			return newNode;
		});

		const nodeIds = nodes.map(function(node) { return node.id; });
		const edges = this.state.graph.edges
			.filter(function(edge) {
				// of all edges return only those,
				// where `from` and `to` are in this group
				return R.contains(edge.from, nodeIds) && R.contains(edge.to, nodeIds);
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
		fragment = helpers.prepareGraphFragment(fragment);

		// add fragment
		this.importModelFragment({fragment});
	}



	removeGroup(action) {
		let that = this;
		let {group, removeNodes} = action;
		let graph = this.state.graph;
		graph.groups = graph.groups.filter(function(g) {
			let keep = group.id != g.id;
			if (!keep && removeNodes) {
				// remove nodes
				g.nodeIds.forEach(function(id) {
					that._removeNode(id);
				});
				g.nodeIds = [];
			}
			return keep;
		});
		this.setState({ graph: graph }); // TODO: be more specific?
	}

	cloneNode(action) {
		const that = this;

		let {node} = action;
		let origNode = node;
		node = _.merge({}, node);

		// create fragment from node
		const nodes = [node].map(function(node) {
			let newNode = _.merge({}, node);
			newNode.x = node.x + 100;
			newNode.y = node.y + 100;
			return newNode;
		});

		const nodeIds = nodes.map(function(node) { return node.id; });
		const edges = this.state.graph.edges
			.filter(function(edge) {
				// also duplicate any existing edges
				return R.contains(edge.from, nodeIds) || R.contains(edge.to, nodeIds);
			})
			.map(function(edge) {
				return _.merge({}, edge);
			});
		let fragment = {
			nodes: nodes,
			edges: edges,
			groups: []
		};

		// prepare fragment
		fragment = helpers.prepareGraphFragment(fragment);

		// if node is in a group, so is the clone
		let groups = helpers.getNodeGroups(origNode.id, this.state.graph.groups);
		if (groups.length > 0) {
			let group = groups[0];
			fragment.nodes.forEach(function(node) {
				group.nodeIds.push(node.id);
			});
		}

		// add fragment
		this.importModelFragment({fragment});
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

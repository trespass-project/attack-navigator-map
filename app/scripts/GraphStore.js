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

// graph.nodes = R.map(
// 	function(i) {
// 		return {
// 			label: i+'',
// 			id: i+'',
// 			type: _.sample(types),
// 			x: Math.random() * 400,
// 			y: Math.random() * 400,
// 		};
// 	},
// 	R.range(0, 5)
// );

// graph.groups = [
// 	{
// 		name: 'group 1',
// 		id: 'group1',
// 		nodeIds: ['1', '2'/*, '4'*/],
// 		_bgImage: {
// 			url: dirs['images']+'/floorplan2.svg'
// 		}
// 	},
// 	{
// 		name: 'group 2',
// 		id: 'group2',
// 		nodeIds: ['3', '0']
// 	}
// ];

// graph.edges = [
// 	{
// 		id: 'edge1',
// 		from: graph.nodes[0].id,
// 		to: graph.nodes[1].id,
// 		relation: 'edge'
// 	}
// ];


module.exports =
class GraphStore extends Store {

	constructor(flux) {
		super();
		let that = this;

		_.pairs(flux.getActionIds(constants.GRAPH))
			.forEach(function(pair, index, collection) {
				let key = pair[0];
				let actionId = pair[1];
				that.register(actionId, that[key]);
			});

		this.state = {
			graph,
			model: null
		};

		this._updateModel();
	}

	_updateModel(graph) {
		graph = graph || this.state.graph;
		var model = trespass.model.create();

		graph.edges.forEach(function(edge) {
			var e = {
				// TODO: ?
				_relation: edge.relation || null,
				source: edge.from,
				target: edge.to,
			};
			trespass.model.addEdge(model, e);
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
					default: // TODO
						break;
				}
			} catch (e) {
				// console.error(e.message);
			}
		});

		this.setState({
			graph: graph,
			model: model,
		});
	}

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

	generateXML(action) {
		var xml = trespass.model.xmlify(this.state.model);
		var blob = new Blob([xml], { type: 'text/plain;charset=utf-8' });
		saveAs(blob, action.filename || 'model.xml');
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

	importModelFragment(action) {
		let {nodes, edges, groups} = action.fragment;
		let xy = action.xy || { x: 0, y: 0 };
		let graph = this.state.graph;

		if (!!nodes) {
			nodes.forEach(function(node, index) {
				node.x = xy.x + (node.x || index*60);
				node.y = xy.y + (node.y || index*30);
				graph.nodes.push(node);
			});
		}

		if (!!groups) {
			groups.forEach(function(group, index) {
				graph.groups.push(group);
			});
		}

		if (!!edges) {
			edges.forEach(function(edge, index) {
				graph.edges.push(edge);
			});
		}

		this._updateModel(graph);
	}

	addEdge(action) {
		let {edge} = action;
		_.defaults(edge, {
			id: helpers.makeId()
		});
		this.state.graph.edges.push(edge);
		this._updateModel();
	}

	removeEdge(action) {
		let {edge} = action;
		this.state.graph.edges = this.state.graph.edges.filter(function(e) {
			return edge.id != e.id;
		});
		this._updateModel();
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

	addNode(action) {
		let {node} = action;

		node = _.defaults(node, {
			id: ''+(new Date()),
			label: 'new node'
		});

		if (node.group) {
			node.group.nodeIds.push(node.id);
			delete node.group;
		}

		this.state.graph.nodes.push(node);
		this._updateModel();
	}

	cloneNode(action) {
		const that = this;

		let {node} = action;
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

		// TODO: what if node is in a group?

		// prepare fragment
		fragment = helpers.prepareGraphFragment(fragment);

		// add fragment
		this.importModelFragment({fragment});
	}

	_removeNode(id) {
		let graph = this.state.graph;

		// remove node
		graph.nodes = graph.nodes.filter(function(node) {
			return id != node.id;
		});

		// and also all edges connected to it
		graph.edges
			.filter(function(edge) {
				return (edge.from === id) || (edge.to === id);
			})
			.map(function(edge) {
				return {edge};
			})
			.forEach(this.removeEdge.bind(this));
	}

	removeNode(action) {
		let {node} = action;
		this._removeNode(node.id);
		this._cleanupGroups();
		this._updateModel();
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

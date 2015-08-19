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

graph.nodes = R.map(
	function(i) {
		return {
			label: i+'',
			id: i+'',
			type: _.sample(types),
			x: Math.random() * 400,
			y: Math.random() * 400,
		};
	},
	R.range(0, 5)
);

graph.groups = [
	{
		name: 'group 1',
		id: 'group1',
		nodeIds: ['1', '2'/*, '4'*/],
		_bgImage: {
			url: dirs['images']+'/floorplan2.svg'
		}
	},
	{
		name: 'group 2',
		id: 'group2',
		nodeIds: ['3', '0']
	}
];

graph.edges = [
	{
		id: 'edge1',
		from: graph.nodes[0].id,
		to: graph.nodes[1].id,
		relation: 'edge'
	}
];


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

		this._updateGraph();
	}

	_updateGraph(graph) {
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
				var $system = trespass.model.parse(data)('system');
				var model = trespass.model.prepare($system);
				that.setState({ model: model });
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

		this._updateGraph(graph);
	}

	addEdge(action) {
		let {edge} = action;
		_.defaults(edge, {
			id: ''+Date.now() // TODO
		});
		this.state.graph.edges.push(edge);
		this._updateGraph();
	}

	removeEdge(action) {
		let {edge} = action;
		this.state.graph.edges = this.state.graph.edges.filter(function(e) {
			return edge.id != e.id;
		});
		this._updateGraph();
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
		this._updateGraph();
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
		this._updateGraph();
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

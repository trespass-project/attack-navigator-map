'use strict';

var _ = require('lodash');
var flummox = require('flummox');
var Store = flummox.Store;
var R = require('ramda');
var helpers = require('./helpers.js');


var graph = {
	nodes: [],
	edges: []
};

graph.nodes = R.map(
	function(i) {
		return {
			label: i+'',
			id: i+'',
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
			url: 'images/floorplan2.svg'
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
		from: graph.nodes[0], // TODO: better only use the id
		to: graph.nodes[1],
		relation: 'edge'
	}
];


module.exports =
class GraphStore extends Store {

	constructor(flux) {
		super();
		let that = this;

		_.pairs(flux.getActionIds('graph'))
			.forEach(function(pair, index, collection) {
				let key = pair[0];
				let actionId = pair[1];
				that.register(actionId, that[key]);
			});

		this.state = {
			graph
		};
	}

	_updateGraph(graph) {
		this.setState({ graph: (graph || this.state.graph) });
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
			id: ''+(new Date())
		});
		this.state.graph.edges.push(edge);
		this.setState({ graph: this.state.graph }); // TODO: be more specific?
	}

	removeEdge(action) {
		let {edge} = action;
		this.state.graph.edges = this.state.graph.edges.filter(function(e) {
			return edge.id != e.id;
		});
		this.setState({ graph: this.state.graph }); // TODO: be more specific?
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
		this.setState({ graph: this.state.graph }); // TODO: be more specific?
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
				return (edge.from.id === id) || (edge.to.id === id);
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
		this.setState({ graph: this.state.graph }); // TODO: be more specific?
	}

	// remove missing nodes
	_cleanupGroups() {
		let nodes = this.state.graph.nodes;
		let groups = this.state.graph.groups;

		groups.forEach(function(group) {
			group.nodeIds = group.nodeIds.filter(function(id) {
				let node = helpers.getNodeById(nodes, id);
				return (!!node);
			});
		});
	}

};

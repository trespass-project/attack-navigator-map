'use strict';

var assert = require('assert');
var chalk = require('chalk');
var R = require('ramda');


var f1 = function(s) {
	return chalk.magenta(s);
};
var f2 = function(s) {
	return chalk.bgMagenta.black(s);
};
var f3 = function(s) {
	return chalk.bgMagenta.white(s);
};


var trespass = require('trespass.js');
var helpers = require('../app/scripts/helpers.js');
var modelHelpers = require('../app/scripts/model-helpers.js');


describe(f1('helpers.js'), function() {

	describe(f2('ellipsize()'), function() {
		it(f3('should work'), function() {
			var input = '0123456789';
			var shortened = helpers.ellipsize(5, input);
			assert(shortened === '012…89' || shortened === '01…789');

			input = '012';
			shortened = helpers.ellipsize(2, input);
			assert(shortened === '0…2');

			input = '01234';
			shortened = helpers.ellipsize(5, input);
			assert(shortened === '01234');

			input = '0';
			shortened = helpers.ellipsize(5, input);
			assert(shortened === '0');
		});
	});
});


describe(f1('model-helpers.js'), function() {

	describe(f2('createNode()'), function() {
		const nodeId = 'old-id';
		const node = { id: nodeId };

		it(f3('should keep id'), function() {
			let keepId = true;
			let newNode = modelHelpers.createNode(node, keepId);
			assert(newNode.id === nodeId);
		});

		it(f3('should create new id'), function() {
			let keepId = false;
			let newNode = modelHelpers.createNode(node, keepId);
			assert(newNode.id !== nodeId);
		});
	});

	describe(f2('graphFromModel()'), function() {
		let model = trespass.model.create();
		model = trespass.model.addEdge(model, {
			source: 'source',
			target: 'target'
		});
		model = trespass.model.addLocation(model, {
			id: 'location'
		});

		let graph = modelHelpers.graphFromModel(model);

		// TODO: more

		it(f3('should create edges'), function() {
			assert(graph.edges.length === 1);
			assert(graph.edges[0].from === 'source');
			assert(graph.edges[0].to === 'target');
		});

		it(f3('should create locations'), function() {
			assert(graph.nodes.length === 1);
		});
	});

	describe(f2('removeNode()'), function() {
		const nodeId = 'node-id';
		let graph = {
			nodes: [ { id: nodeId } ],
			edges: [
				{ from: nodeId, to: 'another' },
				{ from: 'another', to: nodeId },
				{ from: 'another1', to: 'another2' },
			],
			groups: [ { nodeIds: [nodeId] } ],
		};
		const newGraph = modelHelpers.removeNode(graph, nodeId);

		it(f3('should remove node'), function() {
			assert(newGraph.nodes.length === 0);
		});

		it(f3('should remove edges to / from node'), function() {
			assert(newGraph.edges.length === 1);
		});

		it(f3('should remove node from groups'), function() {
			assert(newGraph.groups[0].nodeIds.length === 0);
		});
	});

	describe(f2('removeGroup()'), function() {
		const nodeId = 'node-id';
		const groupId = 'group-id';
		let graph = {
			nodes: [ { id: nodeId } ],
			edges: [],
			groups: [ { id: groupId, nodeIds: [nodeId] } ],
		};
		let removeNodes = true;
		const newGraph = modelHelpers.removeGroup(graph, groupId, removeNodes);

		it(f3('should remove group'), function() {
			assert(newGraph.groups.length === 0);
		});

		it(f3('should remove nodes'), function() {
			assert(newGraph.nodes.length === 0);
		});

		it(f3('should leave nodes alone'), function() {
			const nodeId = 'node-id';
			const groupId = 'group-id';
			let graph = {
				nodes: [ { id: nodeId } ],
				edges: [],
				groups: [ { id: groupId, nodeIds: [nodeId] } ],
			};
			let removeNodes = false;
			const newGraph = modelHelpers.removeGroup(graph, groupId, removeNodes);
			assert(newGraph.nodes.length === 1);
		});
	});

	describe(f2('cloneGroup()'), function() {
		const nodeId = 'node-id';
		const groupId = 'group-id';
		const group = { id: groupId, nodeIds: [nodeId] };
		const graph = {
			nodes: [ { id: nodeId } ],
			edges: [],
			groups: [group],
		};
		const newGraph = modelHelpers.cloneGroup(graph, group);

		it(f3('should create a new group'), function() {
			assert(newGraph.groups.length === 2);
		});

		it(f3('should give cloned group a new id'), function() {
			assert(newGraph.groups[0].id != newGraph.groups[1].id);
		});

		it(f3('should give cloned nodes a new id'), function() {
			assert(newGraph.nodes[0].id != newGraph.nodes[1].id);
		});

		it(f3('should clone only one group'), function() {
			const newNewGraph = modelHelpers.cloneGroup(newGraph, newGraph.groups[1]);
			assert(newNewGraph.groups.length === 3);
		});
	});

	describe(f2('cloneNode()'), function() {
		const nodeId1 = 'node-id-1';
		const nodeId2 = 'node-id-2';
		const groupId = 'group-id';
		const group = { id: groupId, nodeIds: [nodeId1] };
		const graph = {
			nodes: [ { id: nodeId1 }, { id: nodeId2 } ],
			edges: [ { from: nodeId1, to: nodeId2 } ],
			groups: [group],
		};

		const newGraph = modelHelpers.cloneNode(graph, graph.nodes[0]);

		const origNode = newGraph.nodes[0];
		const clonedNode = newGraph.nodes[2];
		const clonedEdge = newGraph.edges[1];

		it(f3('should create a new node'), function() {
			assert(newGraph.nodes.length === graph.nodes.length+1);
		});

		it(f3('should give cloned node a new id'), function() {
			assert(clonedNode.id !== origNode.id);
		});

		it(f3('cloned node should be in original group'), function() {
			assert( R.contains(clonedNode.id, newGraph.groups[0].nodeIds) );
		});

		it(f3('cloned node should have original edges'), function() {
			assert(newGraph.edges.length === 2);
			assert(clonedEdge.to === nodeId2);
			assert(clonedEdge.from === clonedNode.id);
		});
	});

	describe(f2('importModelFragment()'), function() {
		const fragment = {
			nodes: [
				{ id: 'old-id' },
				{},
			]
		};
		const graph = {};
		const newGraph = modelHelpers.importModelFragment(graph, fragment);

		it(f3('should give nodes a new id'), function() {
			// assert(clonedNode.id != origNode.id);
		});
	});

});

'use strict';

var assert = require('assert');
var chalk = require('chalk');
var R = require('ramda');
var _ = require('lodash');


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

	describe(f2('getItemByKey()'), function() {
		const coll = [
			{ id: '1' },
			{ id: '2' },
			{ id: '3' },
			{ id: '4' },
			{ id: '5' }
		];
		const key = 'id';
		const value = '4';
		const badKey = 'name';
		const badValue = '7';

		it(f3('should find the item'), function() {
			const result = helpers.getItemByKey(key, coll, value);
			assert(!!result && result.id === value);
		});

		it(f3('should not find the item #1'), function() {
			const result = helpers.getItemByKey(key, coll, badValue);
			assert(!result);
		});

		it(f3('should not find the item #2'), function() {
			const result = helpers.getItemByKey(badKey, coll, value);
			assert(!result);
		});
	});

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

	describe(f2('isBetween()'), function() {
		it(f3('should work'), function() {
			assert(helpers.isBetween(5, 0, 10));
			assert(!helpers.isBetween(11, 0, 10));
			assert(!helpers.isBetween(-1, 0, 10));
		});
		it(f3('should include edge cases'), function() {
			assert(helpers.isBetween(0, 0, 10));
			assert(helpers.isBetween(10, 0, 10));
		});
	});

	describe(f2('isRectInsideRect()'), function() {
		const rect = { x: 0, y: 0, width: 100, height: 100 };
		const rectInside = { x: 10, y: 10, width: 50, height: 50 };
		const rectOutside = { x: -10, y: -10, width: 5, height: 5 };
		const rectPartiallyInside = { x: -10, y: -10, width: 50, height: 50 };
		const rectFullOverlap = { x: -10, y: -10, width: 120, height: 120 };
		const rectPartialOverlap1 = { x: 40, y: -10, width: 20, height: 120 };
		const rectPartialOverlap2 = { x: -10, y: 40, width: 120, height: 20 };

		it(f3('should work'), function() {
			assert( helpers.isRectInsideRect(rectInside, rect) );
			assert( !helpers.isRectInsideRect(rectOutside, rect) );
		});

		it(f3('partial overlap should be considered "inside" #1'), function() {
			assert( helpers.isRectInsideRect(rectPartiallyInside, rect) );
		});

		it(f3('partial overlap should be considered "inside" #2'), function() {
			assert( helpers.isRectInsideRect(rectPartialOverlap1, rect) );
			assert( helpers.isRectInsideRect(rectPartialOverlap2, rect) );
		});

		it(f3('complete overlap should be considered "inside"'), function() {
			assert( helpers.isRectInsideRect(rectFullOverlap, rect) );
		});
	});

	describe(f2('areAttackerProfilesEqual()'), function() {
		const profile = {
			// "intent": "hostile",
			// "access": "external",
			// "outcomes": [
			// 	"damage",
			// 	"embarrassment"
			// ],
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "skills": "minimal",
			// "objectives": [
			// 	"copy",
			// 	"deny",
			// 	"destroy",
			// 	"damage",
			// 	"take"
			// ],
			// "visibility": "overt"
			budget: 5000,
			skill: 'H',
			time: 'S',
		};
		const profileEqual = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": [
			// 	"embarrassment",
			// 	"damage"
			// ],
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"destroy",
			// 	"deny",
			// 	"copy"
			// ]
			time: 'S',
			skill: 'H',
			budget: 5000,
		};
		const profileNotEqual = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": [
			// 	"embarrassment"
			// ],
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"deny",
			// 	"copy"
			// ]
			budget: 10000,
			skill: 'M',
			time: 'HR',
		};
		const profileIncomplete = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": undefined,
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": undefined,
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"deny",
			// 	"copy"
			// ]
			budget: undefined,
			skill: 'M',
			time: 'HR',
		};

		it(f3('should work with equal profiles'), function() {
			assert(helpers.areAttackerProfilesEqual(profile, profileEqual));
			assert(helpers.areAttackerProfilesEqual(profileEqual, profile));
		});

		it(f3('should work with unequal profiles'), function() {
			assert(!helpers.areAttackerProfilesEqual(profile, profileNotEqual));
			assert(!helpers.areAttackerProfilesEqual(profileNotEqual, profile));
		});

		it(f3('should work with incomplete profiles'), function() {
			assert.doesNotThrow(() => {
				helpers.areAttackerProfilesEqual(profileIncomplete, profileNotEqual);
			});
		});
	});
});


describe(f1('model-helpers.js'), function() {

	describe(f2('getNodeGroups()'), function() {
		const nodeId = 'node-id';
		const groups = [
			{ id: 'group-1', nodeIds: ['a', 'b', 'c'] },
			{ id: 'group-2', nodeIds: ['d', 'node-id', 'e'] },
			{ id: 'group-3', nodeIds: ['f', 'g', 'h'] },
			{ id: 'group-4', nodeIds: ['node-id', 'i', 'j'] },
		];

		it(f3('should return the groups'), function() {
			const nodeGroups = modelHelpers.getNodeGroups(nodeId, groups);
			assert(nodeGroups.length === 2);
			assert(nodeGroups[0].id === 'group-2');
			assert(nodeGroups[1].id === 'group-4');
		});

		it(f3('should return empty list'), function() {
			const nodeGroups = modelHelpers.getNodeGroups('non-existing-node', groups);
			assert(nodeGroups.length === 0);
		});
	});

	describe(f2('getEdgeNodes()'), function() {
		const edge = {
			from: 'node-1',
			to: 'node-2',
		};
		const nodes = [
			{ id: 'node-1' },
			{ id: 'node-2' },
			{ id: 'node-3' },
			{ id: 'node-4' },
		];

		it(f3('should return the groups'), function() {
			const edgeNodes = modelHelpers.getEdgeNodes(edge, nodes);
			assert(edgeNodes.fromNode.id === 'node-1');
			assert(edgeNodes.toNode.id === 'node-2');
		});
	});

	describe(f2('inferEdgeType()'), function() {
		it(f3('edges between locations should have type "connection"'), function() {
			const edgeType = modelHelpers.inferEdgeType('location', 'location');
			assert(edgeType === 'connection');
		});

		it(f3('edges between items should have type "networkConnection"'), function() {
			const edgeType = modelHelpers.inferEdgeType('item', 'item');
			assert(edgeType === 'networkConnection');
		});

		it(f3('edges between items and locations should have type "atLocation"'), function() {
			const edgeType = modelHelpers.inferEdgeType('item', 'location');
			assert(edgeType === 'atLocation');
		});

		// it(f3('spread operator test'), function() {
		// 	const edges = [
		// 		{ type: 'location' },
		// 		{ type: 'location' },
		// 	];
		// 	const edgeType = modelHelpers.inferEdgeType(...(edges.map(R.prop('type'))));
		// 	assert(edgeType === 'connection');
		// });

		it(f3('edge types that cannot be inferred should be undefined'), function() {
			const edgeType = modelHelpers.inferEdgeType('location', 'item');
			assert(!edgeType);
		});
	});

	describe(f2('updateComponentProperties()'), function() {
		const graph = {
			nodes: [
				{ id: 'node-1' },
				{ id: 'node-2' }
			],
			edges: [
				{ id: 'edge-1', from: 'node-1', to: 'node-2' },
				{ id: 'edge-2', from: 'node-2', to: 'node-1' }
			],
			groups: [
				{ id: 'group-1', nodeIds: [] },
				{ id: 'group-2', nodeIds: ['node-1'] }
			]
		};

		it(f3('should work with nodes'), function() {
			const updatedGraph = modelHelpers.updateComponentProperties(
				_.merge({}, graph),
				'node',
				'node-1',
				{ id: 'updated-node-1', attribute: 'test' }
			);
			assert(updatedGraph.nodes[0].id === 'updated-node-1');
		});

		it(f3('should work with edges'), function() {
			const updatedGraph = modelHelpers.updateComponentProperties(
				_.merge({}, graph),
				'edge',
				'edge-1',
				{ from: 'node-3', to: 'node-4' }
			);
			assert(updatedGraph.edges[0].from === 'node-3');
			assert(updatedGraph.edges[0].to === 'node-4');
		});

		it(f3('should work with groups'), function() {
			const updatedGraph = modelHelpers.updateComponentProperties(
				_.merge({}, graph),
				'group',
				'group-2',
				{ nodeIds: ['node-3', 'node-4'] }
			);
			assert(updatedGraph.groups[1].nodeIds.length === 2);
		});
	});

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

	describe(f2('modelAsFragment()'), function() {
		const model = {
			system: {
				title: 'title',
				author: 'author',
				locations: [
					{ id: 'location' }
				],
			}
		};
		const fragment = modelHelpers.modelAsFragment(model);

		it(f3('should ignore metadata'), function() {
			assert(!fragment.title);
			assert(!fragment.author);
			assert(fragment.locations.length === 1);
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
		const {graph, other} = modelHelpers.graphFromModel(model);

		// TODO: test `other`

		it(f3('should create edges'), function() {
			assert(graph.edges.length === 1);
			assert(graph.edges[0].from === 'source');
			assert(graph.edges[0].to === 'target');
		});
		it(f3('should create locations'), function() {
			assert(graph.nodes.length === 1);
			assert(graph.nodes[0].id === 'location');
		});
	});

	describe(f2('addNodeToGroup()'), function() {
		const node = { id: 'node-id' };
		const group = { id: 'group-id', nodeIds: [] };
		let graph = {
			nodes: [node],
			edges: [],
			groups: [group],
		};
		const newGraph = modelHelpers.addNodeToGroup(graph, node.id, group.id);

		it(f3('should work'), function() {
			assert(newGraph.groups[0].nodeIds.length === 1);
			assert(newGraph.groups[0].nodeIds[0] === newGraph.nodes[0].id);
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

	describe(f2('replaceIdInEdge()'), function() {
		it(f3('should stay the same'), function() {
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(edge, 'unknown', 'something');
			assert(newEdge.from === edge.from);
		});

		it(f3('should work with `from`'), function() {
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(edge, 'a', 'something');
			assert(newEdge.from === 'something');
		});

		it(f3('should work with `to`'), function() {
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(edge, 'b', 'something');
			assert(newEdge.to === 'something');
		});
	});

	describe(f2('getNodeEdges()'), () => {
		const node = { id: 'node-id' };
		const edges = [
			{ from: node.id, to: 'other-node' },
			{ from: 'other-other-node', to: node.id },
			{ from: 'other-other-node', to: 'other-node' },
		];
		const nodeEdges = modelHelpers.getNodeEdges(edges, node.id);

		it(f3('should return the right edges'), () => {
			assert(nodeEdges.length === 2);
			assert(nodeEdges[0].from === node.id);
			assert(nodeEdges[1].to === node.id);
		});
	});

	describe(f2('groupToFragment()'), () => {
		const nodes = [
			{ id: 'node-id-1' },
			{ id: 'node-id-2' },
			{ id: 'node-id-3' },
			{ id: 'node-id-4' },
			{ id: 'node-id-5' },
		];
		const edges = [
			{ id: '1', from: 'node-id-1', to: 'node-id-4' },
			{ id: '2', from: 'node-id-4', to: 'node-id-2' },
			{ id: '3', from: 'other-other-node', to: 'other-node' }
		];
		const group = {
			id: 'group-id',
			nodeIds: ['node-id-1', 'node-id-4'],
		}
		const graph = {
			nodes,
			edges,
			groups: [group]
		};
		const fragment = modelHelpers.groupToFragment(graph, group.id);

		it(f3('should create the right fragment'), () => {
			assert(fragment.groups.length === 1);
			assert(fragment.groups[0].nodeIds.length === 2);
			assert(fragment.nodes.length === 2);
			assert(fragment.edges.length === 2);
		});

		it(f3('should return clones, not copies'), () => {
			assert(fragment.groups[0].id !== group.id);
			assert(fragment.nodes[0].id !== nodes[0].id);
			assert(fragment.nodes[1].id !== nodes[3].id);
			assert(fragment.edges[0].id !== edges[0].id);
			assert(fragment.edges[1].id !== edges[1].id);
		});
	});

	describe(f2('nodeToFragment()'), () => {
		const node = { id: 'original-node' };
		const edges = [
			{ from: node.id, to: 'other-node' },
			{ from: 'other-other-node', to: node.id }
		];
		const graph = {
			nodes: [node],
			edges,
			groups: []
		};
		const fragment = modelHelpers.nodeToFragment(graph, node.id);
		console.log(fragment);

		it(f3('should create the right fragment'), () => {
			assert(fragment.nodes.length === 1);
			assert(fragment.edges.length === 2);
			assert(!fragment.groups);
		});

		it(f3('should return clones, not copies'), () => {
			assert(fragment.nodes[0].id !== node.id);
			assert(fragment.edges[0].id !== edges[0].id);
			assert(fragment.edges[1].id !== edges[1].id);
		});
	});

	describe(f2('cloneGroup()'), function() {
		const groupId = 'group-id';
		const group = { id: groupId, nodeIds: ['node-id-1', 'node-id-2', 'node-id-3'] };
		const graph = {
			nodes: [ { id: 'node-id-1' }, { id: 'node-id-2' }, { id: 'node-id-3' } ],
			edges: [],
			groups: [group],
		};
		const newGraph = modelHelpers.cloneGroup(graph, group.id);

		it(f3('should create a new group'), function() {
			assert(newGraph.groups.length === 2);
		});

		it(f3('should give cloned group a new id'), function() {
			assert(newGraph.groups[1].id !== groupId);
		});

		it(f3('original group and cloned group should contain the same number of nodes'), function() {
			assert(newGraph.groups[0].nodeIds.length === newGraph.groups[1].nodeIds.length);
		});

		it(f3('should give cloned nodes a new id'), function() {
			assert(newGraph.groups[0].nodeIds[0] !== newGraph.groups[1].nodeIds[0]);
			assert(newGraph.groups[0].nodeIds[1] !== newGraph.groups[1].nodeIds[1]);
			assert(newGraph.groups[0].nodeIds[2] !== newGraph.groups[1].nodeIds[2]);
		});

		it(f3('all nodes should exist afterwards'), function() {
			assert(newGraph.nodes.length === 6);
		});

		it(f3('all original nodes should be in original group'), function() {
			const origNodeIds = newGraph.groups[0].nodeIds;
			const origNodes = [newGraph.nodes[0], newGraph.nodes[1], newGraph.nodes[2]];
			assert(R.contains(origNodes[0].id, origNodeIds));
			assert(R.contains(origNodes[1].id, origNodeIds));
			assert(R.contains(origNodes[2].id, origNodeIds));
		});

		it(f3('all new nodes should be in new group'), function() {
			const newNodeIds = newGraph.groups[1].nodeIds;
			const newNodes = [newGraph.nodes[3], newGraph.nodes[4], newGraph.nodes[5]];
			assert(R.contains(newNodes[0].id, newNodeIds));
			assert(R.contains(newNodes[1].id, newNodeIds));
			assert(R.contains(newNodes[2].id, newNodeIds));
		});

		it(f3('edges should stay intact, and be cloned as well'), function() {
			const graph = {
				nodes: [
					{ id: 'node-id-1' },
					{ id: 'node-id-2' },
					{ id: 'external-node' }
				],
				groups: [{
					id: 'group-id',
					nodeIds: ['node-id-1', 'node-id-2']
				}],
				edges: [
					{ id: 'edge-1', from: 'node-id-1', to: 'node-id-2' },
					{ id: 'edge-2', from: 'node-id-1', to: 'external-node' },
				],
			};
			const newGraph = modelHelpers.cloneGroup(graph, group.id);

			assert(newGraph.edges.length === 4);

			assert(newGraph.edges[2].id !== newGraph.edges[0].id);
			assert(newGraph.edges[3].id !== newGraph.edges[1].id);

			assert(newGraph.edges[2].from !== newGraph.edges[0].from);
			assert(newGraph.edges[2].to !== newGraph.edges[0].to);

			assert(newGraph.edges[3].from !== newGraph.edges[1].from);
			assert(newGraph.edges[3].to === 'external-node');
		});

		it(f3('should clone only one group'), function() {
			const newNewGraph = modelHelpers.cloneGroup(newGraph, newGraph.groups[1].id);
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

		const newGraph = modelHelpers.cloneNode(graph, graph.nodes[0].id);

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
				{ id: 'node-id-1' },
				{ id: 'node-id-2' },
			],
			edges: [
				{ id: 'edge-id-1' },
				{ id: 'edge-id-2' },
			],
			groups: [
				{ id: 'group-id-1' },
				{ id: 'group-id-2' },
			]
		};
		const graph = {};
		const newGraph = modelHelpers.importModelFragment(graph, fragment);

		it(f3('should import everything'), function() {
			assert(newGraph.nodes.length === fragment.nodes.length);
			assert(newGraph.edges.length === fragment.edges.length);
			assert(newGraph.groups.length === fragment.groups.length);
		});

		// TODO: what else?
	});

	describe(f2('prepareFragment()'), function() {
		const fragment = {
			nodes: [
				{ id: 'node-id-1' },
				{ id: 'node-id-2' },
			],
			edges: [
				{ id: 'edge-id-1', from: 'node-id-1', to: 'node-id-2' },
				{ id: 'edge-id-2' },
			],
			groups: [
				{ id: 'group-id-1', nodeIds: ['node-id-1', 'node-id-2'] },
				{ id: 'group-id-2' },
			]
		};
		const preparedFragment = modelHelpers.prepareFragment( _.merge({}, fragment) );

		it(f3('everything should get a new id'), function() {
			assert(preparedFragment.nodes.length === fragment.nodes.length);
			assert(preparedFragment.nodes[0].id !== fragment.nodes[0].id);
			assert(preparedFragment.nodes[1].id !== fragment.nodes[1].id);

			assert(preparedFragment.edges.length === fragment.edges.length);
			assert(preparedFragment.edges[0].id !== fragment.edges[0].id);
			assert(preparedFragment.edges[1].id !== fragment.edges[1].id);

			assert(preparedFragment.groups.length === fragment.groups.length);
			assert(preparedFragment.groups[0].id !== fragment.groups[0].id);
			assert(preparedFragment.groups[1].id !== fragment.groups[1].id);
		});

		it(f3('edges should stay intact'), function() {
			// console.log(preparedFragment.edges[0]);
			assert(preparedFragment.edges[0].from === preparedFragment.nodes[0].id);
			assert(preparedFragment.edges[0].to === preparedFragment.nodes[1].id);
		});

		it(f3('groups should stay intact'), function() {
			assert(preparedFragment.groups[0].nodeIds[0] === preparedFragment.nodes[0].id);
			assert(preparedFragment.groups[0].nodeIds[1] === preparedFragment.nodes[1].id);
		});
	});

	describe(f2('modelFromGraph()'), function() {
		const graph = {
			nodes: [
				{ id: 'node-1', modelComponentType: 'item', atLocations: ['location'] },
				{ id: 'node-2', modelComponentType: 'data', value: 'value', atLocations: ['location'] },
				{ id: 'node-3', modelComponentType: 'predicate', arity: '2', value: ['value'] }
			]
		};
		const model = modelHelpers.modelFromGraph(graph);

		it(f3('should create elements'), function() {
			assert(model.system.items.length === 1);
			assert(model.system.data.length === 1);
			assert(model.system.predicates.length === 1);
		});

		// TODO: more
	});

});

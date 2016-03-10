'use strict';

const assert = require('assert');
const chalk = require('chalk');
const R = require('ramda');
const _ = require('lodash');


const f1 = (s) => {
	return chalk.magenta(s);
};
const f2 = (s) => {
	return chalk.bgMagenta.black(s);
};
const f3 = (s) => {
	return chalk.bgMagenta.white(s);
};


const trespass = require('trespass.js');
const helpers = require('../app/scripts/helpers.js');
const modelHelpers = require('../app/scripts/model-helpers.js');


describe(f1('helpers.js'), () => {

	describe(f2('getItemByKey()'), () => {
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

		it(f3('should find the item'), () => {
			const result = helpers.getItemByKey(key, coll, value);
			assert(!!result && result.id === value);
		});

		it(f3('should not find the item #1'), () => {
			const result = helpers.getItemByKey(key, coll, badValue);
			assert(!result);
		});

		it(f3('should not find the item #2'), () => {
			const result = helpers.getItemByKey(badKey, coll, value);
			assert(!result);
		});
	});

	describe(f2('ellipsize()'), () => {
		it(f3('should work'), () => {
			let input = '0123456789';
			let shortened = helpers.ellipsize(5, input);
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

	describe(f2('isBetween()'), () => {
		it(f3('should work'), () => {
			assert(helpers.isBetween(5, 0, 10));
			assert(!helpers.isBetween(11, 0, 10));
			assert(!helpers.isBetween(-1, 0, 10));
		});
		it(f3('should include edge cases'), () => {
			assert(helpers.isBetween(0, 0, 10));
			assert(helpers.isBetween(10, 0, 10));
		});
	});

	describe(f2('isRectInsideRect()'), () => {
		const rect = { x: 0, y: 0, width: 100, height: 100 };
		const rectInside = { x: 10, y: 10, width: 50, height: 50 };
		const rectOutside = { x: -10, y: -10, width: 5, height: 5 };
		const rectPartiallyInside = { x: -10, y: -10, width: 50, height: 50 };
		const rectFullOverlap = { x: -10, y: -10, width: 120, height: 120 };
		const rectPartialOverlap1 = { x: 40, y: -10, width: 20, height: 120 };
		const rectPartialOverlap2 = { x: -10, y: 40, width: 120, height: 20 };

		it(f3('should work'), () => {
			assert( helpers.isRectInsideRect(rectInside, rect) );
			assert( !helpers.isRectInsideRect(rectOutside, rect) );
		});

		it(f3('partial overlap should be considered "inside" #1'), () => {
			assert( helpers.isRectInsideRect(rectPartiallyInside, rect) );
		});

		it(f3('partial overlap should be considered "inside" #2'), () => {
			assert( helpers.isRectInsideRect(rectPartialOverlap1, rect) );
			assert( helpers.isRectInsideRect(rectPartialOverlap2, rect) );
		});

		it(f3('complete overlap should be considered "inside"'), () => {
			assert( helpers.isRectInsideRect(rectFullOverlap, rect) );
		});
	});

	describe(f2('areAttackerProfilesEqual()'), () => {
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

		it(f3('should work with equal profiles'), () => {
			assert(helpers.areAttackerProfilesEqual(profile, profileEqual));
			assert(helpers.areAttackerProfilesEqual(profileEqual, profile));
		});

		it(f3('should work with unequal profiles'), () => {
			assert(!helpers.areAttackerProfilesEqual(profile, profileNotEqual));
			assert(!helpers.areAttackerProfilesEqual(profileNotEqual, profile));
		});

		it(f3('should work with incomplete profiles'), () => {
			assert.doesNotThrow(() => {
				helpers.areAttackerProfilesEqual(profileIncomplete, profileNotEqual);
			});
		});
	});
});


describe(f1('model-helpers.js'), () => {

	describe(f2('getNodeGroups()'), () => {
		const nodeId = 'node-id';
		const groups = [
			{ id: 'group-1', nodeIds: ['a', 'b', 'c'] },
			{ id: 'group-2', nodeIds: ['d', 'node-id', 'e'] },
			{ id: 'group-3', nodeIds: ['f', 'g', 'h'] },
			{ id: 'group-4', nodeIds: ['node-id', 'i', 'j'] },
		];

		it(f3('should return the groups'), () => {
			const nodeGroups = modelHelpers.getNodeGroups(nodeId, groups);
			assert(nodeGroups.length === 2);
			assert(nodeGroups[0].id === 'group-2');
			assert(nodeGroups[1].id === 'group-4');
		});

		it(f3('should return empty list'), () => {
			const nodeGroups = modelHelpers.getNodeGroups('non-existing-node', groups);
			assert(nodeGroups.length === 0);
		});
	});

	describe(f2('getEdgeNodes()'), () => {
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

		it(f3('should return the groups'), () => {
			const edgeNodes = modelHelpers.getEdgeNodes(edge, nodes);
			assert(edgeNodes.fromNode.id === 'node-1');
			assert(edgeNodes.toNode.id === 'node-2');
		});
	});

	describe(f2('inferEdgeType()'), () => {
		it(f3('edges between locations should have type "connection"'), () => {
			const edgeType = modelHelpers.inferEdgeType('location', 'location');
			assert(edgeType === 'connection');
		});

		it(f3('edges between items should have type "networkConnection"'), () => {
			const edgeType = modelHelpers.inferEdgeType('item', 'item');
			assert(edgeType === 'networkConnection');
		});

		it(f3('edges between items and locations should have type "atLocation"'), () => {
			const edgeType = modelHelpers.inferEdgeType('item', 'location');
			assert(edgeType === 'atLocation');
		});

		// it(f3('spread operator test'), () => {
		// 	const edges = [
		// 		{ type: 'location' },
		// 		{ type: 'location' },
		// 	];
		// 	const edgeType = modelHelpers.inferEdgeType(...(edges.map(R.prop('type'))));
		// 	assert(edgeType === 'connection');
		// });

		it(f3('edge types that cannot be inferred should be undefined'), () => {
			const edgeType = modelHelpers.inferEdgeType('location', 'item');
			assert(!edgeType);
		});
	});

	describe(f2('updateComponentProperties()'), () => {
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

		it(f3('should work with nodes'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				_.merge({}, graph),
				'node',
				'node-1',
				{ id: 'updated-node-1', attribute: 'test' }
			);
			assert(updatedGraph.nodes[0].id === 'updated-node-1');
		});

		it(f3('should work with edges'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				_.merge({}, graph),
				'edge',
				'edge-1',
				{ from: 'node-3', to: 'node-4' }
			);
			assert(updatedGraph.edges[0].from === 'node-3');
			assert(updatedGraph.edges[0].to === 'node-4');
		});

		it(f3('should work with groups'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				_.merge({}, graph),
				'group',
				'group-2',
				{ nodeIds: ['node-3', 'node-4'] }
			);
			assert(updatedGraph.groups[1].nodeIds.length === 2);
		});
	});

	describe(f2('duplicateNode()'), () => {
		const nodeId = 'old-id';
		const node = { id: nodeId };

		it(f3('should keep id'), () => {
			const keepId = true;
			const newNode = modelHelpers.duplicateNode(node, keepId);
			assert(newNode.id === nodeId);
		});

		it(f3('should create new id'), () => {
			const keepId = false;
			const newNode = modelHelpers.duplicateNode(node, keepId);
			assert(newNode.id !== nodeId);
		});
	});

	describe(f2('duplicateEdge()'), () => {
		const edgeId = 'old-id';
		const edge = { id: edgeId, from: 'x', to: 'y' };

		it(f3('should keep id'), () => {
			const keepId = true;
			const newEdge = modelHelpers.duplicateEdge(edge, keepId);
			assert(newEdge.id === edgeId);
		});

		it(f3('should create new id'), () => {
			const keepId = false;
			const newEdge = modelHelpers.duplicateEdge(edge, keepId);
			assert(newEdge.id !== edgeId);
		});
	});

	describe(f2('duplicateGroup()'), () => {
		const groupId = 'old-id';
		const group = { id: groupId, nodeIds: ['x', 'y'] };

		it(f3('should keep id'), () => {
			const keepId = true;
			const newGroup = modelHelpers.duplicateGroup(group, keepId);
			assert(newGroup.id === groupId);
		});

		it(f3('should create new id'), () => {
			const keepId = false;
			const newGroup = modelHelpers.duplicateGroup(group, keepId);
			assert(newGroup.id !== groupId);
		});
	});

	describe(f2('nodeAsFragment()'), () => {
		const node = { id: 'node-id' };

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.nodeAsFragment(node);
			assert(fragment.nodes.length === 1);
			assert(fragment.nodes[0].id === node.id);
		});
	});

	describe(f2('nodeAsFragmentInclEdges()'), () => {
		const node = { id: 'node-id' };
		const edges = [
			{ from: 'node-id', to: 'asdf' },
			{ from: 'qwer', to: 'node-id' },
			{ from: 'qwer', to: 'asdf' },
		];

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.nodeAsFragmentInclEdges(node, edges);
			assert(fragment.nodes.length === 1);
			assert(fragment.nodes[0].id === node.id);
			assert(fragment.edges.length === 2);
		});
	});

	describe(f2('edgeAsFragment()'), () => {
		const edge = { id: 'edge-id' };

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.edgeAsFragment(edge);
			assert(fragment.edges.length === 1);
		});
	});

	describe(f2('edgeAsFragmentInclNodes()'), () => {
		const edge = { id: 'edge-id' };
		const nodes = [
			{ node: 'node-1' },
			{ node: 'node-2' },
		];

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.edgeAsFragmentInclNodes(edge, nodes);
			assert(fragment.edges.length === 1);
			assert(fragment.nodes.length === 2);
		});
	});

	describe(f2('groupAsFragment()'), () => {
		const nodes = [
			{ id: 'node-0' },
			{ id: 'node-1' },
			{ id: 'node-2' },
			{ id: 'node-3' },
			{ id: 'node-4' },
		];
		const group = {
			id: 'group-id',
			nodeIds: ['node-1', 'node-2', 'node-3']
		};
		const graph = { nodes, edges: [], groups: [group] };

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.groupAsFragment(graph, group);
			assert(fragment.groups.length === 1);
			assert(fragment.groups[0].nodeIds.length === 3);
			assert(fragment.nodes.length === 3);
			assert(fragment.nodes[0].id === 'node-1');
		});
	});

	describe(f2('replaceIdInGroup()'), () => {
		const group = {
			id: 'group-id',
			nodeIds: ['node-1', 'node-2', 'node-3']
		};
		const mapping = {
			'node-2': 'a',
			'node-3': 'b',
			'bla': 'c',
		};

		it(f3('should change the ids'), () => {
			const changedGroup = modelHelpers.replaceIdInGroup(mapping, group);
			assert(changedGroup.nodeIds[0] === 'node-1');
			assert(changedGroup.nodeIds[1] === 'a');
			assert(changedGroup.nodeIds[2] === 'b');
		});
	});

	describe(f2('replaceIdInEdge()'), () => {
		it(f3('should stay the same'), () => {
			const mapping = {};
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.from === edge.from);
		});

		it(f3('should work with `from`'), () => {
			const mapping = { 'a': 'something' };
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.from === 'something');
		});

		it(f3('should work with `to`'), () => {
			const mapping = { 'b': 'something' };
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.to === 'something');
		});
	});

	describe(f2('duplicateFragment()'), () => {
		const nodes = [
			{ id: 'node-1' },
			{ id: 'node-2' },
			{ id: 'node-3' },
		];
		const groups = [
			{ id: 'group-1', nodeIds: ['node-1', 'node-2'] },
		];
		const edges = [
			{ id: 'edge-1', from: 'node-1', to: 'node-2' },
			{ id: 'edge-2', from: 'node-3', to: 'node-2' },
			{ id: 'edge-3', from: 'node-x', to: 'node-1' },
		];
		const fragment = { nodes, edges, groups };
		const dupFragment = modelHelpers.duplicateFragment(fragment);

		it(f3('should contain all the right things'), () => {
			assert(dupFragment.nodes.length === fragment.nodes.length);
			assert(dupFragment.edges.length === fragment.edges.length);
			assert(dupFragment.groups.length === fragment.groups.length);
		});

		it(f3('should create new ids for everything inside'), () => {
			fragment.nodes.forEach((node, index) => {
				assert(node.id !== dupFragment.nodes[index].id);
			});
			fragment.edges.forEach((edge, index) => {
				assert(edge.id !== dupFragment.edges[index].id);
			});
			fragment.groups.forEach((group, index) => {
				assert(group.id !== dupFragment.groups[index].id);
			});
		});

		it(f3('should use new node ids in edges'), () => {
			const dupEdges = dupFragment.edges;
			assert(dupEdges[0].from === dupFragment.nodes[0].id);
			assert(dupEdges[0].to === dupFragment.nodes[1].id);
			assert(dupEdges[1].from === dupFragment.nodes[2].id);
			assert(dupEdges[1].to === dupFragment.nodes[1].id);
			assert(dupEdges[2].from === 'node-x');
			assert(dupEdges[2].to === dupFragment.nodes[0].id);
		});

		it(f3('should use new node ids in groups'), () => {
			const dupGroup = dupFragment.groups[0];
			assert(dupGroup.nodeIds[0] === dupFragment.nodes[0].id);
			assert(dupGroup.nodeIds[1] === dupFragment.nodes[1].id);
		});
	});

	describe(f2('combineFragments()'), () => {
		const fragment1 = {
			nodes: [{ id: 'node-1' }],
			edges: [{ id: 'edge-1' }],
			groups: [],
		};
		const fragment2 = {
			nodes: [{ id: 'node-2' }, { id: 'node-3' }],
			edges: [{ id: 'edge-2' }],
			groups: [{ id: 'group-1' }, { id: 'group-2' }],
		};
		const combinedFragement = modelHelpers.combineFragments([fragment1, fragment2]);

		it(f3('should create edges'), () => {
			assert(combinedFragement.nodes.length === 3);
			assert(combinedFragement.edges.length === 2);
			assert(combinedFragement.groups.length === 2);
		});
	});

	describe(f2('importFragment()'), () => {
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
		const newGraph = modelHelpers.importFragment(graph, fragment);

		it(f3('should import everything'), () => {
			assert(newGraph.nodes.length === fragment.nodes.length);
			assert(newGraph.edges.length === fragment.edges.length);
			assert(newGraph.groups.length === fragment.groups.length);
		});

		// TODO: what else?
	});

	describe(f2('graphFromModel()'), () => {
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

		it(f3('should create edges'), () => {
			assert(graph.edges.length === 1);
			assert(graph.edges[0].from === 'source');
			assert(graph.edges[0].to === 'target');
		});
		it(f3('should create locations'), () => {
			assert(graph.nodes.length === 1);
			assert(graph.nodes[0].id === 'location');
		});
	});

	describe(f2('addNodeToGroup()'), () => {
		const node = { id: 'node-id' };
		const group = { id: 'group-id', nodeIds: [] };
		let graph = {
			nodes: [node],
			edges: [],
			groups: [group],
		};
		const newGraph = modelHelpers.addNodeToGroup(graph, node.id, group.id);

		it(f3('should work'), () => {
			assert(newGraph.groups[0].nodeIds.length === 1);
			assert(newGraph.groups[0].nodeIds[0] === newGraph.nodes[0].id);
		});
	});

	describe(f2('removeNode()'), () => {
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

		it(f3('should remove node'), () => {
			assert(newGraph.nodes.length === 0);
		});

		it(f3('should remove edges to / from node'), () => {
			assert(newGraph.edges.length === 1);
		});

		it(f3('should remove node from groups'), () => {
			assert(newGraph.groups[0].nodeIds.length === 0);
		});
	});

	describe(f2('removeGroup()'), () => {
		const nodeId = 'node-id';
		const groupId = 'group-id';
		let graph = {
			nodes: [ { id: nodeId } ],
			edges: [],
			groups: [ { id: groupId, nodeIds: [nodeId] } ],
		};
		let removeNodes = true;
		const newGraph = modelHelpers.removeGroup(graph, groupId, removeNodes);

		it(f3('should remove group'), () => {
			assert(newGraph.groups.length === 0);
		});

		it(f3('should remove nodes'), () => {
			assert(newGraph.nodes.length === 0);
		});

		it(f3('should leave nodes alone'), () => {
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

	describe(f2('modelFromGraph()'), () => {
		const graph = {
			nodes: [
				{ id: 'node-1', modelComponentType: 'item', atLocations: ['location'] },
				{ id: 'node-2', modelComponentType: 'data', value: 'value', atLocations: ['location'] },
				{ id: 'node-3', modelComponentType: 'predicate', arity: '2', value: ['value'] }
			]
		};
		const model = modelHelpers.modelFromGraph(graph);

		it(f3('should create elements'), () => {
			assert(model.system.items.length === 1);
			assert(model.system.data.length === 1);
			assert(model.system.predicates.length === 1);
		});

		// TODO: more
	});

	describe(f2('cloneNode()'), () => {
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

		it(f3('should create a new node'), () => {
			assert(newGraph.nodes.length === (graph.nodes.length + 1));
		});

		it(f3('should give cloned node a new id'), () => {
			assert(clonedNode.id !== origNode.id);
		});

		it(f3('cloned node should have original edges'), () => {
			assert(newGraph.edges.length === 2);
			assert(clonedEdge.to === nodeId2);
			assert(clonedEdge.from === clonedNode.id);
		});

		it(f3('cloned node should be in original group'), () => {
			assert( R.contains(clonedNode.id, newGraph.groups[0].nodeIds) );
		});
	});

	describe(f2('cloneGroup()'), () => {
		const groupId = 'group-id';
		const group = { id: groupId, nodeIds: ['node-id-1', 'node-id-2', 'node-id-3'] };
		const graph = {
			nodes: [ { id: 'node-id-1' }, { id: 'node-id-2' }, { id: 'node-id-3' } ],
			edges: [],
			groups: [group],
		};
		const newGraph = modelHelpers.cloneGroup(graph, group.id);

		it(f3('should create a new group'), () => {
			assert(newGraph.groups.length === 2);
		});

		it(f3('should give cloned group a new id'), () => {
			assert(newGraph.groups[1].id !== groupId);
		});

		it(f3('original group and cloned group should contain the same number of nodes'), () => {
			assert(newGraph.groups[0].nodeIds.length === newGraph.groups[1].nodeIds.length);
		});

		it(f3('should give cloned nodes a new id'), () => {
			assert(newGraph.groups[0].nodeIds[0] !== newGraph.groups[1].nodeIds[0]);
			assert(newGraph.groups[0].nodeIds[1] !== newGraph.groups[1].nodeIds[1]);
			assert(newGraph.groups[0].nodeIds[2] !== newGraph.groups[1].nodeIds[2]);
		});

		it(f3('all nodes should exist afterwards'), () => {
			assert(newGraph.nodes.length === 6);
		});

		it(f3('all original nodes should be in original group'), () => {
			const origNodeIds = newGraph.groups[0].nodeIds;
			const origNodes = [newGraph.nodes[0], newGraph.nodes[1], newGraph.nodes[2]];
			assert(R.contains(origNodes[0].id, origNodeIds));
			assert(R.contains(origNodes[1].id, origNodeIds));
			assert(R.contains(origNodes[2].id, origNodeIds));
		});

		it(f3('all new nodes should be in new group'), () => {
			const newNodeIds = newGraph.groups[1].nodeIds;
			const newNodes = [newGraph.nodes[3], newGraph.nodes[4], newGraph.nodes[5]];
			assert(R.contains(newNodes[0].id, newNodeIds));
			assert(R.contains(newNodes[1].id, newNodeIds));
			assert(R.contains(newNodes[2].id, newNodeIds));
		});

		it(f3('edges should stay intact, and be cloned as well'), () => {
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

		it(f3('should clone only one group'), () => {
			const newNewGraph = modelHelpers.cloneGroup(newGraph, newGraph.groups[1].id);
			assert(newNewGraph.groups.length === 3);
		});
	});
});

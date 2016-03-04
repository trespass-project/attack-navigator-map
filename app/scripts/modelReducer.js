'use strict';

const R = require('ramda');
const _ = require('lodash');
const trespass = require('trespass.js');
const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


const initialState = {
	graph: {
		nodes: [],
		edges: [],
		groups: [],
	},
	predicates: {},
	metadata: {
		id: undefined,
	},
};


const modelFromGraph = _.debounce(
	modelHelpers.modelFromGraph,
	1000,
	{ leading: true, trailing: true }
);


module.exports =
function reducer(state=initialState, action) {
	const mergeWithState = R.partial(mergeWith, [state]);

	// once, in the other reducer, is enough
	// console.log(action);

	switch (action.type) {
		case constants.ACTION_initMap: {
			const {modelId} = action;
			const newState = _.merge(
				{},
				initialState,
				{
					metadata: {
						id: modelId
					}
				}
			);
			return newState;
		}

		case constants.ACTION_addGroupBackgroundImage: {
			const {groupId, dataURI, aspectRatio/*, width*/} = action;

			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);

			group._bgImage = group._bgImage || {};
			group._bgImage.url = dataURI;
			group._bgImage.width = 550;
			group._bgImage.height = 550 / aspectRatio;

			return newState;
		}

		case constants.ACTION_resizeGroupBackgroundImage: {
			const {groupId, width, height} = action;

			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);

			if (!group._bgImage) {
				return state;
			}

			const minSize = 100;
			group._bgImage.width = Math.max(width, minSize);
			group._bgImage.height = Math.max(height, minSize);

			return newState;
		}

		case constants.ACTION_moveGroupBackgroundImage: {
			const {groupId, groupCenterOffsetXY} = action;

			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);

			if (!group._bgImage) {
				return state;
			}

			group._bgImage.groupCenterOffsetX = groupCenterOffsetXY.x;
			group._bgImage.groupCenterOffsetY = groupCenterOffsetXY.y;

			return newState;
		}

		case constants.ACTION_removeGroupBackgroundImage: {
			const {groupId} = action;
			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);
			delete group._bgImage;
			return newState;
		}

		case constants.ACTION_importModelFragment: {
			const {fragment, xy} = action;
			const graph = modelHelpers.importModelFragment(
				state.graph,
				modelHelpers.prepareFragment(fragment),
				xy
			);
			return mergeWithState({ graph });
		}

		case constants.ACTION_updateModel: {
			const model = modelFromGraph(state.graph);
			if (!model) { // debounced
				return state;
			}
			return mergeWithState({ model });
		}

		// case constants.ACTION_loadXML:
		// 	return state; // noop

		case constants.ACTION_loadXML_DONE: {
			const {graph, other, metadata} = action.result;
			return _.merge(
				{},
				initialState,
				{ graph, metadata },
				other
			);
		}

		case constants.ACTION_downloadAsXML: {
			const model = modelHelpers.modelFromGraph(state.graph);
			modelHelpers.downloadAsXML(
				model,
				`${model.system.title.replace(/\s/g, '-')}.xml`
			);
			return state;
		}

		case constants.ACTION_addNodeToGroup: {
			const {nodeId, groupId} = action;
			const newGraph = modelHelpers.addNodeToGroup(state.graph, nodeId, groupId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_cloneNode: {
			const {nodeId} = action;
			const newGraph = modelHelpers.cloneNode(state.graph, nodeId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_removeNode: {
			const {node} = action;
			const newGraph = modelHelpers.removeNode(state.graph, node.id);
			return mergeWithState({ graph: newGraph });
		}

		// TODO: fix this
		case constants.ACTION_moveNode: {
			const {nodeId, xy} = action;
			let newState = _.merge({}, state);
			let node = helpers.getItemById(newState.graph.nodes, nodeId);
			node.x = xy.x;
			node.y = xy.y;
			return newState;
		}

		case constants.ACTION_ungroupNode: {
			const {node} = action;
			const newState = mergeWithState(state);

			function isIdEqual(id) {
				return R.equals(id, node.id);
			}

			// remove node from all groups it is in
			newState.graph.groups = newState.graph.groups
				.map((group) => {
					group.nodeIds = R.uniq( R.reject(isIdEqual, group.nodeIds) );
					return group;
				});

			return newState;
		}

		// TODO: fix this
		case constants.ACTION_moveGroup: {
			const {group, posDelta} = action;
			let newState = _.merge({}, state);
			group.nodeIds
				.forEach(function(id) {
					let node = helpers.getItemById(newState.graph.nodes, id);
					node.x += posDelta.x;
					node.y += posDelta.y;
				});
			return newState;
		}

		case constants.ACTION_addEdge: {
			const {edge} = action;

			if (edge.from === edge.to) {
				console.warn('edge.from and edge.to cannot be the same');
				return state;
			}

			const newState = mergeWithState(state);
			newState.graph.edges = [
				...newState.graph.edges,
				_.merge(edge, { id: helpers.makeId('edge') })
				// TODO: use modelHelpers.createEdge()
			]
			return newState;
		}

		case constants.ACTION_removeEdge: {
			const {edge} = action;
			const newState = mergeWithState(state);
			newState.graph.edges = state.graph.edges
				.filter(e => edge.id !== e.id);
			return newState;
		}

		case constants.ACTION_addGroup: {
			const {group} = action;
			const newState = mergeWithState(state);
			newState.graph.groups = [
				...newState.graph.groups,
				_.merge(group, { // TODO: use modelHelpers.createGroup()
					id: helpers.makeId('group'),
					name: 'new group', // TODO: should be label
					nodeIds: []
				})
			];
			return newState;
		}

		case constants.ACTION_cloneGroup: {
			const {groupId} = action;
			const newState = mergeWithState(state);
			newState.graph = modelHelpers.cloneGroup(newState.graph, groupId);
			return newState;
		}

		case constants.ACTION_removeGroup: {
			const {groupId, removeNodes} = action;
			return mergeWithState({
				graph: modelHelpers.removeGroup(
					state.graph,
					groupId,
					removeNodes
				)
			});
		}

		// TODO: fix this
		case constants.ACTION_updateComponentProperties: {
			const {componentId, graphComponentType, newProperties} = action;
			let newState = _.merge({}, state);
			newState.graph = modelHelpers.updateComponentProperties(
				newState.graph,
				graphComponentType,
				componentId,
				newProperties
			);
			return newState;
		}

		default: {
			return state;
		}
	}
};

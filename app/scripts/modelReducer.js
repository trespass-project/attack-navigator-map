const update = require('react-addons-update');
const R = require('ramda');
const _ = require('lodash');
const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


const noop = () => {};


const initialState = {
	metadata: {
		id: null,
		title: 'Untitled',
		// TODO: version?
	},

	graph: {
		nodes: {},
		edges: {},
		groups: {},

		// other
		predicates: {},
		policies: {},
		processes: {},
		// ...
	},
};


// const modelFromGraph = _.debounce(
// 	modelHelpers.modelFromGraph,
// 	1000,
// 	{ leading: true, trailing: true }
// );


module.exports.reducer =
function reducer(state=initialState, action) {
	const mergeWithState = R.partial(mergeWith, [state]);

	// once, in the other reducer, is enough
	// console.log(action);

	switch (action.type) {
		case constants.ACTION_initMap: {
			const { modelId, metadata } = action;
			const title = (metadata && metadata.title)
				? metadata.title
				: undefined;
			const meta = {
				id: modelId,
				title,
			};
			const newState = _.merge(
				state,
				{ metadata: meta }
			);
			return newState;
		}

		case constants.ACTION_updateMetadata: {
			return update(
				state,
				{ metadata: { $merge: action.metadata } }
			);
		}

		case constants.ACTION_resetMap: {
			return _.merge(
				{},
				initialState
			);
		}

		case constants.ACTION_addGroupBackgroundImage: {
			const { groupId, dataURI, aspectRatio/*, width*/ } = action;
			const newGraph = modelHelpers.addGroupBackgroundImage(
				state.graph,
				groupId,
				dataURI,
				aspectRatio
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_resizeGroupBackgroundImage: {
			const { groupId, width, height } = action;

			const minSize = 100;
			const newGraph = modelHelpers.resizeGroupBackgroundImage(
				state.graph,
				groupId,
				Math.max(width, minSize),
				Math.max(height, minSize)
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_moveGroupBackgroundImage: {
			const { groupId, groupCenterOffsetXY } = action;
			const newGraph = modelHelpers.moveGroupBackgroundImage(
				state.graph,
				groupId,
				groupCenterOffsetXY
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_removeGroupBackgroundImage: {
			const { groupId } = action;
			const newGraph = modelHelpers.removeGroupBackgroundImage(
				state.graph,
				groupId
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_importFragment: {
			const { fragment, xy, cb=noop } = action;
			const newGraph = modelHelpers.importFragment(
				state.graph,
				modelHelpers.duplicateFragment(fragment),
				xy,
				(importedNodesMap) => {
					cb(
						state.metadata.id,
						R.values(importedNodesMap)
					);
				}
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_mergeFragment: {
			const { fragment, cb=noop } = action;
			const newGraph = modelHelpers.combineFragments([
				state.graph,
				fragment
			]);
			cb(
				state.metadata.id,
				R.values(fragment.nodes)
			);
			return mergeWithState({ graph: newGraph });
		}

		// case constants.ACTION_updateModel: {
		// 	const model = modelFromGraph(state.graph);
		// 	if (!model) { // debounced
		// 		return state;
		// 	}
		// 	return mergeWithState({ model });
		// }

		// case constants.ACTION_loadXML:
		// 	return state; // noop

		case constants.ACTION_humanizeModelIds: {
			const { done } = action;
			const { newGraph, idReplacementMap } = modelHelpers.humanizeModelIds(state.graph);
			done(idReplacementMap);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_addNodeToGroup: {
			const { nodeId, groupId } = action;
			const newGraph = modelHelpers.addNodeToGroup(state.graph, nodeId, groupId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_cloneNode: {
			const { nodeId } = action;
			const newGraph = modelHelpers.cloneNode(state.graph, nodeId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_removeNode: {
			const { nodeId, cb } = action;
			const newGraph = modelHelpers.removeNode(
				state.graph,
				nodeId,
				(nodeId) => { cb(state.metadata.id, nodeId); }
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_moveNode: {
			const { nodeId, xy } = action;
			const newGraph = modelHelpers.moveNode(state.graph, nodeId, xy);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_nodesStorePosition: {
			const nodes = R.values(state.graph.nodes)
				.map((node) => {
					return Object.assign(
						{},
						node,
						{ _x: node.x },
						{ _y: node.y }
					);
				});
			return mergeWithState({
				graph: update(
					state.graph,
					{ nodes: { $set: helpers.toHashMap('id', nodes) } }
				)
			});
		}

		case constants.ACTION_nodesRestorePosition: {
			const nodes = R.values(state.graph.nodes)
				.map((node) => {
					return Object.assign(
						{},
						node,
						{ x: node._x || node.x },
						{ y: node._y || node.y }
					);
				});
			return mergeWithState({
				graph: update(
					state.graph,
					{ nodes: { $set: helpers.toHashMap('id', nodes) } }
				)
			});
		}

		case constants.ACTION_ungroupNode: {
			const { nodeId } = action;
			const newGraph = modelHelpers.ungroupNode(state.graph, nodeId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_moveGroup: {
			const { groupId, posDelta } = action;
			const newGraph = modelHelpers.moveGroup(state.graph, groupId, posDelta);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_addEdge: {
			const { edge, cb } = action;

			if (edge.from === edge.to) {
				console.warn('edge.from and edge.to cannot be the same');
				return state;
			}

			const newGraph = modelHelpers.addEdge(state.graph, edge, cb);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_removeEdge: {
			const { edgeId } = action;
			const newGraph = modelHelpers.removeEdge(state.graph, edgeId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_addGroup: {
			const { group } = action;
			const newGraph = modelHelpers.addGroup(state.graph, group);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_cloneGroup: {
			const { groupId } = action;
			const newGraph = modelHelpers.cloneGroup(state.graph, groupId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_removeGroup: {
			const { groupId, removeNodes, cb } = action;
			const newGraph = modelHelpers.removeGroup(
				state.graph,
				groupId,
				removeNodes,
				(nodeIds) => {
					nodeIds.forEach((nodeId) => {
						cb(state.metadata.id, nodeId);
					});
				}
			);
			return mergeWithState({	graph: newGraph });
		}

		case constants.ACTION_updateComponentProperties: {
			const { componentId, graphComponentType, newProperties, cb } = action;
			const newGraph = modelHelpers.updateComponentProperties(
				state.graph,
				graphComponentType,
				componentId,
				newProperties,
				(updatedItem) => { cb(state.metadata.id, updatedItem); }
			);
			return mergeWithState({	graph: newGraph });
		}

		case constants.ACTION_addProcess: {
			const { process } = action;
			const newGraph = modelHelpers.addProcess(state.graph, process);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_addPolicy: {
			const { policy } = action;
			const newGraph = modelHelpers.addPolicy(state.graph, policy);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_addPredicate: {
			const { predicate } = action;
			const newGraph = modelHelpers.addPredicate(state.graph, predicate);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_predicateChanged: {
			const { predicateId, newProperties } = action;
			const newGraph = modelHelpers.updatePredicate(
				state.graph,
				predicateId,
				newProperties
			);
			return mergeWithState({	graph: newGraph });
		}

		default: {
			return state;
		}
	}
};

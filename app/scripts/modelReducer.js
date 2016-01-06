'use strict';

let R = require('ramda');
let _ = require('lodash');
let trespass = require('trespass.js');
let helpers = require('./helpers.js');
let modelHelpers = require('./model-helpers.js');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


const initialState = {
	graph: {
		nodes: [],
		edges: [],
		groups: [],
	},
	// model: null,
	model: trespass.model.create(),
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
		case constants.ACTION_addGroupBackgroundImage: {
			let {group, dataURI, aspectRatio, width} = action;
			group._bgImage = group._bgImage || {};
			group._bgImage.url = dataURI;
			group._bgImage.width = 550;
			group._bgImage.height = 550 / aspectRatio;
			// return mergeWithState({ showEdges: action.yesno });
			// TODO:
			return state;
		}

		case constants.ACTION_importModelFragment: {
			const {fragment, xy} = action;
			const graph = modelHelpers.importModelFragment(state.graph, fragment, xy);

			return _.merge({}, state, { graph: graph });
		}

		case constants.ACTION_updateModel: {
			const model = modelFromGraph(state.graph);
			if (!model) { // debounced
				return state;
			}
			return _.merge({}, state, { model: model });
		}

		case constants.ACTION_loadXML: {
			return state; // TODO: implement
		}

		case constants.ACTION_downloadAsXML: {
			const model = modelHelpers.modelFromGraph(state.graph);
			modelHelpers.downloadAsXML(
				model,
				model.system.title.replace(/\s/g, '-') + '.xml'
			);
			return state;
		}

		case constants.ACTION_moveNode: {
			const {node, xy} = action;

			// TODO: is this necessary?
			let newState = _.merge({}, state);
			let n = helpers.getItemById(newState.graph.nodes, node.id);
			n.x = xy.x;
			n.y = xy.y;
			return newState;
		}

		case constants.ACTION_moveGroup: {
			const {group, posDelta} = action;

			// TODO: is this necessary?
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

			// TODO: is this necessary?
			let newState = _.merge({}, state);
			newState.graph.edges.push( _.merge(edge, { id: helpers.makeId(0, 'edge') }) );
			return newState;
		}

		case constants.ACTION_addGroup: {
			const {group} = action;

			// TODO: is this necessary?
			let newState = _.merge({}, state);
			newState.graph.groups.push(
				_.merge(group, {
					id: helpers.makeId(0, 'group'),
					label: 'new group',
					nodeIds: []
				})
			);
			return newState;
		}

		case constants.ACTION_removeGroup: {
			const {group, removeNodes} = action;
			return _.merge({}, state, {
				graph: modelHelpers.removeGroup(_.merge({}, state.graph), group.id, removeNodes)
			});
		}

		default: {
			return state;
		}
	}
};

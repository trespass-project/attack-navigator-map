'use strict';

let R = require('ramda');
let _ = require('lodash');
let trespass = require('trespass.js');
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
			return _.merge({}, state, { graph });
		}

		case constants.ACTION_loadXML: {
			return state; // TODO: implement
		}

		default: {
			return state;
		}
	}
};

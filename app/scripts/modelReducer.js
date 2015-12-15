'use strict';

let R = require('ramda');
let trespass = require('trespass.js');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


let initialState = {
	graph: {
		nodes: [],
		edges: [],
		groups: [],
	},
	// model: null,
	model: trespass.model.create(),
};


module.exports =
function reducer(state, action) {
	state = state || initialState;
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
			break;
		}

		case constants.ACTION_importModelFragment: {
			return state;
			break;
		}

		default: {
			return state;
			break;
		}
	}
};

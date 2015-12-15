'use strict';

var $ = require('jquery');
var R = require('ramda');
var _ = require('lodash');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');
const theme = require('./graph-theme-default.js');


var initialState = {
	drag: null,
	dragNode: null,
	hoverNode: null,
	hoverGroup: null,
	previewEdge: null,

	spacePressed: false,
	mouseOverEditor: false,
	panning: false,
	pannable: false,

	interfaceMode: 'light', // pro
	wizard: {
		selectedSection: 'import'
	},

	showEdgeLabels: true,
	showNodeLabels: true,
	showGroupLabels: true,
	showImages: true,
	showEdges: true,
	showGroups: true,
	contextMenu: null,

	selected: null,

	editorElem: null,
	editorTransformElem: null,
	editorElemSize: null,
	visibleRect: null,

	theme,
	scale: 1,
	panX: 0,
	panY: 0,
};


module.exports =
function reducer(state, action) {
	state = state || initialState;
	const mergeWithState = R.partial(mergeWith, [state]);

	const blacklist = [
		constants.ACTION_setMouseOverEditor
	];
	if (!R.contains(action.type, blacklist)) {
		console.log(action);
	}

	switch (action.type) {
		case constants.ACTION_setEditorElem:
			const {elem} = action;
			const editorElem = elem;
			const editorTransformElem = $(elem).children('g').first()[0];
			let editorElemSize = state.editorElemSize || null;

			if (!state.editorElem) {
				const $editor = $(editorElem);
				editorElemSize = {
					width: $editor.width(),
					height: $editor.height(),
				};
			}

			return mergeWithState({editorElem, editorTransformElem, editorElemSize});
			break;

		case constants.ACTION_select:
			return mergeWithState({ selected: action.selected });
			break;

		case constants.ACTION_showContextMenu:
		case constants.ACTION_hideContextMenu:
			return mergeWithState({ contextMenu: action.contextMenu });
			break;

		case constants.ACTION_setShowImages:
			return mergeWithState({ showImages: action.yesno });
			break;

		case constants.ACTION_setShowGroups:
			return mergeWithState({ showGroups: action.yesno });
			break;

		case constants.ACTION_setShowEdges:
			return mergeWithState({ showEdges: action.yesno });
			break;

		case constants.ACTION_setTransformation:
			let {scale/*, panX, panY*/} = action.transformation;

			let showEdgeLabels = false;
			const threshold = 0.5;
			scale = scale || state.scale;
			showEdgeLabels = (scale >= threshold);
			const showNodeLabels = showEdgeLabels;
			const showGroupLabels = showEdgeLabels;

			let visibleRect = null;
			if (state.editorElem) {
				const editorElem = state.editorElem;
				const editorTransformElem = state.editorTransformElem;
				const visibleRectPosition = helpers.unTransformFromTo(
					editorElem,
					editorTransformElem,
					{ x: 0,
					  y: 0 }
				);
				visibleRect = {
					x: visibleRectPosition.x,
					y: visibleRectPosition.y,
					width: state.editorElemSize.width / scale,
					height: state.editorElemSize.height / scale,
				};
			}

			const mergeThis = _.merge(
				{},
				{showEdgeLabels, showNodeLabels, showGroupLabels, visibleRect},
				action.transformation
			);
			return mergeWithState(mergeThis);
			break;

		case constants.ACTION_setPreviewEdge:
			return mergeWithState({ previewEdge: action.previewEdge });
			break;

		case constants.ACTION_setDrag:
			return mergeWithState({ drag: action.data });
			break;

		case constants.ACTION_setDragNode:
			return mergeWithState({ dragNode: action.node });
			break;

		case constants.ACTION_setHoverNode:
			return mergeWithState({ hoverNode: action.node });
			break;

		case constants.ACTION_setHoverGroup:
			return mergeWithState({ hoverGroup: action.group });
			break;

		case constants.ACTION_setSpacePressed:
			return mergeWithState({ spacePressed: action.yesno });
			break;

		case constants.ACTION_setMouseOverEditor:
			return mergeWithState({ mouseOverEditor: action.yesno });
			break;

		case constants.ACTION_setPanning:
			return mergeWithState({ panning: action.yesno });
			break;

		case constants.ACTION_setPannable:
			return mergeWithState({ pannable: action.yesno });
			break;

		case constants.ACTION_selectWizardStep:
			const newState = mergeWithState({ wizard: { selectedSection: action.name } });
			return newState;
			break;

		default:
			return state;
			break;
	}
};

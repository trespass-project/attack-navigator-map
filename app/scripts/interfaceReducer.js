'use strict';

const $ = require('jquery');
const R = require('ramda');
const _ = require('lodash');
const mergeWith = require('./reducer-utils.js').mergeWith;
const omitType = require('./reducer-utils.js').omitType;
const constants = require('./constants.js');
const helpers = require('./helpers.js');
const theme = require('./graph-theme-default.js');


const initialState = {
	drag: null,
	dragNode: null,
	hoverNode: null,
	hoverGroup: null,
	previewEdge: null,

	spacePressed: false,
	mouseOverEditor: false,
	panning: false,
	pannable: false,

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

	interfaceMode: 'light', // 'pro'

	wizardSelectedSection: 'import',

	// ——————————

	attackerProfileIds: [],
	attackerProfiles: {},
	attackerProfile: null,

	attackerGoalType: null,
	attackerGoal: null,
	attackerProfit: undefined,

	toolChainIds: [],
	toolChains: {},
	toolChainId: null,
	analysisRunning: false,

	componentTypes: [],
	relationTypes: [],
	modelPatterns: [],
};


const blacklist = [
	constants.ACTION_setEditorElem,
	constants.ACTION_setMouseOverEditor,
	constants.ACTION_hideContextMenu,
	constants.ACTION_select,
	constants.ACTION_setPanning,
	constants.ACTION_setDrag,
	constants.ACTION_setDragNode,
	constants.ACTION_selectWizardStep,
	constants.ACTION_setAttackerProfit,
	constants.ACTION_moveNode,
	constants.ACTION_moveGroup,
	constants.ACTION_setHoverNode,
	constants.ACTION_setHoverGroup,
	constants.ACTION_setPreviewEdge,
	constants.ACTION_setTransformation,
	constants.ACTION_updateComponentProperties,
];
// const whitelist = [
// 	constants.ACTION_loadXMLFile,
// 	constants.ACTION_loadXML,
// 	constants.ACTION_loadXML_DONE,
// 	constants.ACTION_attackerProfileChanged,
// 	constants.ACTION_setAttackerGoal,
// 	constants.ACTION_runAnalysis,
// 	constants.ACTION_initMap,
// ];


module.exports =
function reducer(state=initialState, action) {
	// const mergeWithState = R.partial(mergeWith, [state]);

	if (!R.contains(action.type, blacklist)) {
		console.log(action.type, omitType(action));
	}
	// if (R.contains(action.type, whitelist)) {
	// 	console.log(action.type, omitType(action));
	// }

	switch (action.type) {
		case constants.ACTION_setEditorElem: {
			const {elem} = action;
			const editorElem = elem;
			const $editor = $(editorElem);
			const editorTransformElem = $editor.children('g').first()[0];
			let editorElemSize = state.editorElemSize || null;

			if (!state.editorElem) {
				editorElemSize = {
					width: $editor.width(),
					height: $editor.height(),
				};
			}

			return _.extend({}, state, {editorElem, editorTransformElem, editorElemSize});
		}

		case constants.ACTION_select:
			return _.extend({}, state, {
				selected: {
					componentId: action.componentId,
					graphComponentType: action.graphComponentType,
				},
			});

		case constants.ACTION_showContextMenu:
		case constants.ACTION_hideContextMenu:
			return _.extend({}, state, { contextMenu: action.contextMenu });

		case constants.ACTION_setShowImages:
			return _.extend({}, state, { showImages: action.yesno });

		case constants.ACTION_setShowGroups:
			return _.extend({}, state, { showGroups: action.yesno });

		case constants.ACTION_setShowEdges:
			return _.extend({}, state, { showEdges: action.yesno });

		case constants.ACTION_setTransformation: {
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
					{ x: 0, y: 0 }
				);
				visibleRect = {
					x: visibleRectPosition.x,
					y: visibleRectPosition.y,
					width: state.editorElemSize.width / scale,
					height: state.editorElemSize.height / scale,
				};
			}

			const mergeThis = _.extend(
				{showEdgeLabels, showNodeLabels, showGroupLabels, visibleRect},
				action.transformation
			);
			return _.extend({}, state, mergeThis);
		}

		case constants.ACTION_setPreviewEdge:
			return _.extend({}, state, { previewEdge: action.previewEdge });

		case constants.ACTION_setDrag: {
			const newState = _.extend({}, state, { drag: action.data });
			return newState;
		}

		case constants.ACTION_setDragNode:
			return _.extend({}, state, { dragNode: action.node });

		case constants.ACTION_setHoverNode:
			return _.extend({}, state, { hoverNode: action.node });

		case constants.ACTION_setHoverGroup:
			return _.extend({}, state, { hoverGroup: action.group });

		case constants.ACTION_setSpacePressed:
			return _.extend({}, state, { spacePressed: action.yesno });

		case constants.ACTION_setMouseOverEditor:
			state.mouseOverEditor = action.yesno;
			return state;

		case constants.ACTION_setPanning:
			return _.extend({}, state, { panning: action.yesno });

		case constants.ACTION_setPannable:
			return _.extend({}, state, { pannable: action.yesno });

		case constants.ACTION_selectWizardStep:
			return _.extend({}, state, { wizardSelectedSection: action.name });

		case constants.ACTION_attackerProfileChanged: {
			const {profile} = action;
			return _.extend({}, state, { attackerProfile: profile });
		}

		case constants.ACTION_setAttackerGoal: {
			const {goalType, goalData} = action;
			return _.extend({}, state, {
				attackerGoalType: goalType,
				attackerGoal: goalData,
			});
		}

		case constants.ACTION_setAttackerProfit: {
			const {profit} = action;
			return _.extend({}, state, { attackerProfit: profit });
		}

		case constants.ACTION_runAnalysis: {
			return _.extend({}, state, {
				analysisRunning: true,
				toolChainId: action.toolChainId,
			});
		}

		case constants.ACTION_loadToolChains: {
			return state; // noop
		}
		case constants.ACTION_loadToolChains_DONE: {
			const { ids, items } = action.normalizedToolChains;
			return _.extend({}, state, {
				toolChainIds: ids,
				toolChains: items,
			});
		}

		case constants.ACTION_loadAttackerProfiles: {
			return state; // noop
		}
		case constants.ACTION_loadAttackerProfiles_DONE: {
			const { ids, items } = action.normalizedAttackerProfiles;
			return _.extend({}, state, {
				attackerProfileIds: ids,
				attackerProfiles: items,
			});
		}

		// case constants.ACTION_loadComponentTypes: {
		// 	return state; // noop
		// }
		case constants.ACTION_loadComponentTypes_DONE: {
			const {componentTypes} = action;
			return mergeWithState({componentTypes});
		}

		case constants.ACTION_loadModelPatterns_DONE: {
			const {modelPatterns} = action;
			return mergeWithState({modelPatterns});
		}

		case constants.ACTION_loadRelationTypes_DONE: {
			const {relationTypes} = action;
			return mergeWithState({relationTypes});
		}

		default:
			return state;
	}
};

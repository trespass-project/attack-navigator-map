'use strict';

const $ = require('jquery');
const R = require('ramda');
const mergeWith = require('./reducer-utils.js').mergeWith;
const omitType = require('./reducer-utils.js').omitType;
const constants = require('./constants.js');
const helpers = require('./helpers.js');
const theme = require('./graph-theme-default.js');


const initialState = {
	drag: null,
	dragNodeId: null,
	hoverNodeId: null,
	hoverGroupId: null,
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

	selectedId: null,
	selectedType: null,

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

	// this should not be here
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

	relationTypes: [],
	kbTypeAttributes: {},
	componentsLib: [],
	modelPatterns: [], // pre-made fragments
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
	const mergeWithState = R.partial(mergeWith, [state]);

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

			return mergeWithState({editorElem, editorTransformElem, editorElemSize});
		}

		case constants.ACTION_select: {
			return mergeWithState({
				selectedId: action.componentId,
				selectedType: action.graphComponentType,
			});
		}

		case constants.ACTION_showContextMenu:
		case constants.ACTION_hideContextMenu:
			return mergeWithState({ contextMenu: action.contextMenu });

		case constants.ACTION_setShowImages:
			return mergeWithState({ showImages: action.yesno });

		case constants.ACTION_setShowGroups:
			return mergeWithState({ showGroups: action.yesno });

		case constants.ACTION_setShowEdges:
			return mergeWithState({ showEdges: action.yesno });

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

			const mergeThis = Object.assign(
				{showEdgeLabels, showNodeLabels, showGroupLabels, visibleRect},
				action.transformation
			);
			return mergeWithState(mergeThis);
		}

		case constants.ACTION_setPreviewEdge:
			return mergeWithState({ previewEdge: action.previewEdge });

		case constants.ACTION_setDrag:
			return mergeWithState({ drag: action.data });

		case constants.ACTION_setDragNode:
			return mergeWithState({ dragNodeId: action.nodeId });

		case constants.ACTION_setHoverNode:
			return mergeWithState({ hoverNodeId: action.nodeId });

		case constants.ACTION_setHoverGroup:
			return mergeWithState({ hoverGroupId: action.groupId });

		case constants.ACTION_setSpacePressed:
			return mergeWithState({ spacePressed: action.yesno });

		case constants.ACTION_setMouseOverEditor:
			return mergeWithState({ mouseOverEditor: action.yesno });

		case constants.ACTION_setPanning:
			return mergeWithState({ panning: action.yesno });

		case constants.ACTION_setPannable:
			return mergeWithState({ pannable: action.yesno });

		case constants.ACTION_selectWizardStep:
			return mergeWithState({ wizardSelectedSection: action.name });

		case constants.ACTION_attackerProfileChanged:
			return mergeWithState({ attackerProfile: action.profile });

		case constants.ACTION_setAttackerGoal:
			return mergeWithState({
				attackerGoalType: action.goalType,
				attackerGoal: action.goalData,
			});

		case constants.ACTION_setAttackerProfit:
			return mergeWithState({ attackerProfit: action.profit });

		case constants.ACTION_setSelectedToolChain:
			return mergeWithState({
				toolChainId: action.toolChainId,
			});

		case constants.ACTION_runAnalysis:
			return mergeWithState({
				analysisRunning: true,
				// toolChainId: action.toolChainId,
			});

		// case constants.ACTION_loadToolChains:
		// 	return state; // noop

		case constants.ACTION_loadToolChains_DONE: {
			const { ids, items } = action.normalizedToolChains;
			return mergeWithState({
				toolChainIds: ids,
				toolChains: items,
			});
		}

		// case constants.ACTION_loadAttackerProfiles:
		// 	return state; // noop

		case constants.ACTION_loadAttackerProfiles_DONE: {
			const { ids, items } = action.normalizedAttackerProfiles;
			return mergeWithState({
				attackerProfileIds: ids,
				attackerProfiles: items,
			});
		}

		// case constants.ACTION_loadComponentTypes: {
		// 	return state; // noop
		// }
		case constants.ACTION_loadComponentTypes_DONE: {
			const {componentsLib, kbTypeAttributes} = action;
			return mergeWithState({componentsLib, kbTypeAttributes});
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

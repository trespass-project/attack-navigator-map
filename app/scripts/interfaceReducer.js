const update = require('react-addons-update');
const $ = require('jquery');
const R = require('ramda');
const moment = require('moment');
const mergeWith = require('./reducer-utils.js').mergeWith;
const omitType = require('./reducer-utils.js').omitType;
const constants = require('./constants.js');
const helpers = require('./helpers.js');
const theme = require('./graph-theme-default.js');
const relationsLib = require('./relation-lib.js');


// layers
const ValidationLayer = require('./ValidationLayer.js');
const HighlightLayer = require('./HighlightLayer.js');
const PredicateLayer = require('./PredicateLayer.js');
const GroupedComponentsLayer = require('./GroupedComponentsLayer.js');

const availableLayersList = [
	ValidationLayer,
	PredicateLayer,
	HighlightLayer,
	GroupedComponentsLayer,
];

const defaultActiveLayersList = [
	ValidationLayer,
	PredicateLayer,
	HighlightLayer,
];


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

	recentModels: [],

	// this should not be here
	attackerProfileIds: [],
	attackerProfiles: {},
	attackerProfile: undefined,
	attackerGoalType: null,
	attackerGoal: null,
	attackerProfit: undefined,
	attackerActorId: null,

	toolChainIds: [],
	toolChains: {},
	toolChainId: null,
	taskStatusCategorized: undefined,

	relationTypes: relationsLib,
	kbTypeAttributes: {},
	componentsLib: [],
	modelComponentTypeToKbTypes: [],

	modelPatterns: [], // pre-made fragments

	// ——————————

	availableLayersList: availableLayersList,
	activeLayers: helpers.toHashMap('name', defaultActiveLayersList),
};


const anmDataPickFromState =
module.exports.anmDataPickFromState = [
	'attackerProfile',
	'attackerGoalType',
	'attackerGoal',
	'attackerProfit',
	'attackerActorId',
	'toolChainId',
];


// after making labels human-readable,
// we also need to update the ids in some parts of the state
function updateStateIds(idReplacementMap, state) {
	function replaceOrNot(currentId) {
		return idReplacementMap[currentId] || currentId;
	}

	const updateData = {};

	if (state.attackerActorId) {
		updateData.attackerActorId = {
			$set: replaceOrNot(state.attackerActorId)
		};
	}

	if (state.toolChainId) {
		updateData.toolChainId = {
			$set: replaceOrNot(state.toolChainId)
		};
	}

	if (state.attackerGoal
		&& state.attackerGoal.assetGoal
		&& state.attackerGoal.assetGoal.asset) {
		updateData.attackerGoal = {
			assetGoal: {
				asset: {
					$set: replaceOrNot(state.attackerGoal.assetGoal.asset)
				}
			}
		};
	}

	return update(state, updateData);
}


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
	constants.ACTION_setTaskStatusCategorized,
	constants.ACTION_updateComponentProperties,
	constants.ACTION_setHighlighted,
];
// const whitelist = [
// 	constants.ACTION_loadModelFile,
// 	constants.ACTION_loadXML,
// 	constants.ACTION_attackerProfileChanged,
// 	constants.ACTION_setAttackerGoal,
// 	constants.ACTION_runAnalysis,
// 	constants.ACTION_initMap,
// ];


module.exports.reducer =
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
			const { elem } = action;
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

			return mergeWithState({ editorElem, editorTransformElem, editorElemSize });
		}

		case constants.ACTION_initMap: {
			const { anmData={} } = action;
			return mergeWithState(anmData.interface || {});
		}

		case constants.ACTION_resetMap: {
			return mergeWithState(
				R.pick(['wizardSelectedSection'], initialState)
			);
		}

		case constants.ACTION_getRecentFiles: {
			let { models } = action;
			models
				.forEach((model) => {
					delete model['epoch-created'];
					delete model['epoch-modified'];
					model['date-created'] = moment(model['date-created'])
						.format('YYYY-MM-DD HH:mm');
					model['date-modified'] = moment(model['date-modified'])
						.format('YYYY-MM-DD HH:mm');
				});
			models = R.sort(
				// sort newest first
				(a, b) => b['date-modified'].localeCompare(a['date-modified'], 'en-us'),
				models
			);

			return mergeWithState({ recentModels: /*R.take(5, */models/*)*/ });
		}

		case 'ACTION_humanizeModelIds_updateInterfaceState': {
			return updateStateIds(action.idReplacementMap, state);
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
			let { scale/*, panX, panY*/ } = action.transformation;

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
				{ showEdgeLabels, showNodeLabels, showGroupLabels, visibleRect },
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

		case constants.ACTION_setAttackerActor:
			return mergeWithState({ attackerActorId: action.actorId });

		case constants.ACTION_setAttackerProfit:
			return mergeWithState({ attackerProfit: action.profit });

		case constants.ACTION_setSelectedToolChain:
			return mergeWithState({
				toolChainId: action.toolChainId,
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
			const { componentsLib, kbTypeAttributes, modelComponentTypeToKbTypes } = action;
			return mergeWithState({ componentsLib, kbTypeAttributes, modelComponentTypeToKbTypes });
		}

		case constants.ACTION_loadModelPatterns_DONE: {
			const { modelPatterns } = action;
			return mergeWithState({ modelPatterns });
		}

		case constants.ACTION_showSaveDialog: {
			const { yesNo } = action;
			return mergeWithState({ showSaveDialog: yesNo });
		}

		case constants.ACTION_enableLayer: {
			const { layerName, isEnabled } = action;
			const _activeLayersList = R.values(state.activeLayers);
			const theLayer = R.find(R.propEq('name', layerName), availableLayersList);

			let activeLayersList;
			if (!isEnabled) {
				activeLayersList = R.filter(
					(layer) => (layer.name !== layerName),
					_activeLayersList
				);
			} else {
				activeLayersList = [
					..._activeLayersList,
					theLayer
				];
			}
			return mergeWithState({
				activeLayers: helpers.toHashMap('name', activeLayersList)
			});
		}

		case constants.ACTION_setHighlighted: {
			const { highlightIds } = action;
			return mergeWithState({ highlightIds });
		}

		case constants.ACTION_addPredicatesToRelationTypes: {
			const { predicates } = action;
			const relationTypes = R.uniq(
				[...state.relationTypes, ...predicates]
			);
			return mergeWithState({ relationTypes });
		}

		default:
			return state;
	}
};

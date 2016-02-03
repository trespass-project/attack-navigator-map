'use strict';

// let $ = require('jquery');
// let Q = require('q');
let R = require('ramda');
let _ = require('lodash');
const constants = require('./constants.js');
const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');


// let requests = {};
// function abortRequests(requests, key) {
// 	requests[key] = requests[key] || [];
// 	requests[key].forEach(function(req) { req.abort(); });
// 	requests[key].length = 0;
// }


function handleError(err) {
	if (err.statusText === 'abort') { return; }
	console.error(err.stack);
}

// ——————————


module.exports.setEditorElem =
function setEditorElem(elem) {
	return {
		type: constants.ACTION_setEditorElem,
		elem,
	};
};


module.exports.showContextMenu =
function showContextMenu(event, menuItems) {
	event.preventDefault();
	event.stopPropagation();
	return {
		type: constants.ACTION_showContextMenu,
		contextMenu: {
			x: event.clientX,
			y: event.clientY,
			menuItems
		}
	};
};


module.exports.hideContextMenu =
function hideContextMenu(event, context, menuItems) {
	return {
		type: constants.ACTION_hideContextMenu,
		contextMenu: null
	};
};


module.exports.importModelFragment =
function importModelFragment(fragment, xy) {
	return function(dispatch, getState) {
		dispatch({
			type: constants.ACTION_importModelFragment,
			fragment,
			xy
		});

		// update model afterwards:
		// dispatch({ type: constants.ACTION_updateModel });
	};
};


module.exports.select =
function select(componentId, graphComponentType) {
	return {
		type: constants.ACTION_select,
		componentId, graphComponentType
	};
};


module.exports.setShowImages =
function setShowImages(yesno) {
	return {
		type: constants.ACTION_setShowImages,
		yesno
	};
};


module.exports.setShowGroups =
function setShowGroups(yesno) {
	return {
		type: constants.ACTION_setShowGroups,
		yesno
	};
};


module.exports.setShowEdges =
function setShowEdges(yesno) {
	return {
		type: constants.ACTION_setShowEdges,
		yesno
	};
};


module.exports.addGroupBackgroundImage =
function addGroupBackgroundImage(groupId, dataURI, aspectRatio, width) {
	return {
		type: constants.ACTION_addGroupBackgroundImage,
		groupId, dataURI, aspectRatio, width
	};
};


module.exports.removeGroupBackgroundImage =
function removeGroupBackgroundImage(groupId) {
	return {
		type: constants.ACTION_removeGroupBackgroundImage,
		groupId
	};
};


module.exports.resizeGroupBackgroundImage =
function resizeGroupBackgroundImage(groupId, width, height) {
	return {
		type: constants.ACTION_resizeGroupBackgroundImage,
		groupId, width, height
	};
};


module.exports.moveGroupBackgroundImage =
function moveGroupBackgroundImage(groupId, groupCenterOffsetXY) {
	return {
		type: constants.ACTION_moveGroupBackgroundImage,
		groupId, groupCenterOffsetXY
	};
};


const setTransformation =
module.exports.setTransformation =
function setTransformation(transformation) {
	return {
		type: constants.ACTION_setTransformation,
		transformation
	};
};


module.exports.resetTransformation =
function resetTransformation() {
	return setTransformation({
		scale: 1,
		panX: 0,
		panY: 0
	});
};


module.exports.setPreviewEdge =
function setPreviewEdge(previewEdge) {
	return {
		type: constants.ACTION_setPreviewEdge,
		previewEdge
	};
};


module.exports.setDrag =
function setDrag(data) {
	return function(dispatch, getState) {
		dispatch({
			type: constants.ACTION_setDrag,
			data
		});

		if (data == null) { // done dragging
			// dispatch({ type: constants.ACTION_updateModel });
			// TODO: actually, updating the model is not necessary.
			// only for live debug view
		}
	};

};


module.exports.setDragNode =
function setDragNode(node) {
	return {
		type: constants.ACTION_setDragNode,
		node
	};
};


module.exports.setHoverNode =
function setHoverNode(node) {
	return {
		type: constants.ACTION_setHoverNode,
		node
	};
};


module.exports.setHoverGroup =
function setHoverGroup(group) {
	return {
		type: constants.ACTION_setHoverGroup,
		group
	};
};


module.exports.setSpacePressed =
function setSpacePressed(yesno) {
	return {
		type: constants.ACTION_setSpacePressed,
		yesno
	};
};


module.exports.setMouseOverEditor =
function setMouseOverEditor(yesno) {
	return {
		type: constants.ACTION_setMouseOverEditor,
		yesno
	};
};


module.exports.addNode =
function addNode(node) {
	return {
		type: constants.ACTION_addNode,
		node
	};
};


module.exports.cloneNode =
function cloneNode(node) {
	return {
		type: constants.ACTION_cloneNode,
		node
	};
};


module.exports.addNodeToGroup =
function addNodeToGroup(nodeId, groupId) {
	return {
		type: constants.ACTION_addNodeToGroup,
		nodeId, groupId
	};
};


module.exports.removeNode =
function removeNode(node) {
	return {
		type: constants.ACTION_removeNode,
		node
	};
};


module.exports.moveNode =
function moveNode(nodeId, xy) {
	return {
		type: constants.ACTION_moveNode,
		nodeId,
		xy
	};
};


module.exports.ungroupNode =
function ungroupNode(node) {
	return {
		type: constants.ACTION_ungroupNode,
		node
	};
};


module.exports.moveGroup =
function moveGroup(group, posDelta) {
	return {
		type: constants.ACTION_moveGroup,
		group,
		posDelta
	};
};


module.exports.cloneGroup =
function cloneGroup(groupId) {
	return {
		type: constants.ACTION_cloneGroup,
		groupId
	};
};


module.exports.setPanning =
function setPanning(yesno) {
	return {
		type: constants.ACTION_setPanning,
		yesno
	};
};


module.exports.setPannable =
function setPannable(yesno) {
	return {
		type: constants.ACTION_setPannable,
		yesno
	};
};


module.exports.selectWizardStep =
function selectWizardStep(name) {
	return {
		type: constants.ACTION_selectWizardStep,
		name
	};
};

// TODO: autoLayout


const loadXMLFile =
module.exports.loadXMLFile =
function loadXMLFile(file) {
	return function(dispatch, getState) {
		const action = {
			type: constants.ACTION_loadXMLFile,
			file,
		};
		dispatch(action);

		// ———

		let reader = new FileReader();
		reader.onload = function(event) {
			const content = event.target.result;
			dispatch( loadXML(content) );
		};
		reader.readAsText(file);
	};
};


const loadXML =
module.exports.loadXML =
function loadXML(xmlString) {
	return function(dispatch, getState) {
		dispatch({
			type: constants.ACTION_loadXML,
			xml: xmlString,
		});

		modelHelpers.XMLModelToGraph(xmlString, function(err, graph) {
			if (err) { return; }
			dispatch({
				type: constants.ACTION_loadXML_DONE,
				graph
			});
		});
	};
};


const downloadAsXML =
module.exports.downloadAsXML =
function downloadAsXML() {
	return {
		type: constants.ACTION_downloadAsXML,
	};
};


const addEdge =
module.exports.addEdge =
function addEdge(edge) {
	return {
		type: constants.ACTION_addEdge,
		edge
	};
};


const removeEdge =
module.exports.removeEdge =
function removeEdge(edge) {
	return {
		type: constants.ACTION_removeEdge,
		edge
	};
};


const addGroup =
module.exports.addGroup =
function addGroup(group) {
	return {
		type: constants.ACTION_addGroup,
		group
	};
};


const removeGroup =
module.exports.removeGroup =
function removeGroup(groupId, removeNodes=false) {
	return {
		type: constants.ACTION_removeGroup,
		groupId, removeNodes
	};
};


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(componentId, graphComponentType, newProperties) {
	return {
		type: constants.ACTION_updateComponentProperties,
		componentId, graphComponentType, newProperties
	};
};


const attackerProfileChanged =
module.exports.attackerProfileChanged =
function attackerProfileChanged(profile) {
	return {
		type: constants.ACTION_attackerProfileChanged,
		profile
	};
};


const setAttackerGoal =
module.exports.setAttackerGoal =
function setAttackerGoal(goalType, goalData) {
	return {
		type: constants.ACTION_setAttackerGoal,
		goalType,
		goalData
	};
};


const runAnalysis =
module.exports.runAnalysis =
function runAnalysis() {
	return function(dispatch, getState) {
		// collect relevant data
		const data = R.pick([
			'attackerProfile',
			'attackerGoalType',
			'attackerGoal'
		], getState().interface);

		dispatch({
			type: constants.ACTION_runAnalysis,
		});

	};
};


// ——————————
/*
module.exports.openDir =
function openDir(dirName) {
	return function(dispatch, getState) {
		Q().then(function() {
				const action = {
					type: constants.OPEN_DIR,
					selectedSubdir: dirName,
				};
				dispatch(action);
			})
			.catch(handleError);
	};
};
*/

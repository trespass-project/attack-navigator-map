'use strict';

const $ = require('jquery');
const Q = require('q');
const R = require('ramda');
const _ = require('lodash');
const JSZip = require('jszip');
require('whatwg-fetch');
const queryString = require('query-string');
const trespassModel = require('trespass.js').model;
const api = require('trespass.js').api;
const toolsApi = api.tools;
const knowledgebaseApi = api.knowledgebase;
const constants = require('./constants.js');
const modelHelpers = require('./model-helpers.js');
const helpers = require('./helpers.js');

// TODO: move API stuff to trespass.js
const fakeApi = require('../../api.js');
const serverPort = require('../../api.js').serverPort;
const serverDomain = require('../../api.js').serverDomain;
function fakeApiUrl(url) {
	return 'http://' + serverDomain + ':' + serverPort + url;
}


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


const initMap =
module.exports.initMap =
function initMap(modelId=undefined) {
	return function(dispatch, getState) {
		const id = modelId || helpers.makeId('model');
		dispatch({
			type: constants.ACTION_initMap,
			modelId: id,
		});

		// check if model with that id already exists ...
		dispatch(
			kbGetModel(
				id,

				// handleExists
				(res, modelId) => {
					// TODO: do s.th. with the data
				},

				// handleMissing
				(modelId) => {
					// ... otherwise create it
					dispatch( kbCreateModel(modelId) );
				}
			)
		);
	};
};


const kbGetModel =
module.exports.kbGetModel =
function kbGetModel(modelId, handleExists, handleMissing) {
	if (!modelId) {
		console.error('no model id provided');
		return;
	}

	return function(dispatch, getState) {
		dispatch({
			type: constants.ACTION_kbGetModel,
			modelId
		});

		const url = api.makeUrl(knowledgebaseApi, `model/${modelId}`);
		const params = _.merge(
			{},
			api.requestOptions.fetch.crossDomain
		);
		fetch(url, params)
			.catch((err) => {
				console.error(err);
			})
			.then((res) => {
				if (res.status === 404) {
					if (handleMissing) {
						handleMissing(modelId);
					}
				} else if (res.status === 200) {
					if (handleExists) {
						handleExists(res, modelId);
					}
				} else {
					console.error(`something went wrong: ${res.status}`);
				}
			});
	};
};


const kbCreateModel =
module.exports.kbCreateModel =
function kbCreateModel(modelId) {
	// TODO: only create model, once model/graph is not empty anymore.
	// otherwise we might be creatings tons of empty ones ...

	if (!modelId) {
		console.error('no model id provided');
		return;
	}

	return function(dispatch, getState) {
		dispatch({
			type: constants.ACTION_kbCreateModel,
			modelId
		});

		const url = api.makeUrl(knowledgebaseApi, `model/${modelId}`);
		const params = _.merge(
			{ method: 'put', },
			api.requestOptions.fetch.crossDomain
		);
		fetch(url, params)
			.catch((err) => {
				console.error(err);
			})
			.then((res) => {
				if (res.status === 200) {
					dispatch(
						kbGetModel(
							modelId,
							(res, modelId) => {
								// TODO: do s.th. with the data
							}
						)
					);
				} else {
					console.error(`something went wrong: ${res.status}`);
				};
			});
	};
};


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


module.exports.dropModelFragment =
function dropModelFragment(fragment, clientOffset) {
	return function(dispatch, getState) {
		const state = getState();
		const editorXY = helpers.coordsRelativeToElem(
			state.interface.editorElem,
			clientOffset
		);
		const modelXY = helpers.unTransformFromTo(
			state.interface.editorElem,
			state.interface.editorTransformElem,
			editorXY
		);
		dispatch( importModelFragment(fragment, modelXY) );
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

		modelHelpers.XMLModelToGraph(xmlString, function(err, graph, other) {
			if (err) { return; }
			dispatch( initMap(other.modelId) );
			dispatch({
				type: constants.ACTION_loadXML_DONE,
				graph, other
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


const setAttackerProfit =
module.exports.setAttackerProfit =
function setAttackerProfit(profit) {
	return {
		type: constants.ACTION_setAttackerProfit,
		profit
	};
};


const putModelAndScenarioIntoKnowledgebase =
module.exports.putModelAndScenarioIntoKnowledgebase =
function putModelAndScenarioIntoKnowledgebase(modelId, modelData, scenarioData) {
	const tasksData = [
		{
			data: modelData.fileContent,
			query: queryString.stringify({
				model_id: modelId,
				filename: modelData.fileName,
				filetype: modelData.fileType,
			})
		},
		{
			data: scenarioData.fileContent,
			query: queryString.stringify({
				model_id: modelId,
				filename: scenarioData.fileName,
				filetype: scenarioData.fileType,
			})
		}
	];

	const taskFuncs = tasksData
		.map((item, index) => {
			const url = `${api.makeUrl(knowledgebaseApi, 'files')}?${item.query}`;
			const params = _.merge(
				{
					method: 'put',
					body: item.data
				},
				api.requestOptions.fetch.crossDomain
			);

			return () => {
				return fetch(url, params)
					.catch((err) => {
						console.error(err);
					})
					.then((res) => {
						if (res.status === 200) {
							console.log('success (200)', url);
						} else {
							console.error(`something went wrong (${res.status})`, url);
						}
					});
			};
		});

	const resolved = Promise.resolve();
	const promise = taskFuncs
		.reduce((acc, taskFunc) => {
			return acc.then(taskFunc);
		}, resolved);

	return promise;
};


const runAnalysis =
module.exports.runAnalysis =
function runAnalysis(toolChainId, downloadScenario=false) {
	return function(dispatch, getState) {
		const state = getState();
		// collect relevant data
		const data = R.pick([
			'attackerProfile',
			'attackerGoalType',
			'attackerGoal',
			'attackerProfit',
		], state.interface);

		const modelId = state.model.modelId;
		if (!modelId) {
			throw new Error('missing model id');
		}

		// generate model xml
		let model = modelHelpers.modelFromGraph(state.model.graph);
		model.system.id = modelId;
		const modelXmlStr = trespassModel.toXML(model);
		// console.log(modelXmlStr);

		// generate scenario xml
		const modelFileName = 'model.xml';
		const scenarioFileName = 'scenario.xml';
		const zipFileName = 'scenario.zip';
		const attackerId = data.attackerGoal[data.attackerGoalType].attacker;
		const assetId = data.attackerGoal[data.attackerGoalType].asset;
		const profit = data.attackerProfit;
		let scenario = trespassModel.createScenario();
		scenario = trespassModel.scenarioSetModel(scenario, modelFileName);
		scenario = trespassModel.scenarioSetAssetGoal(scenario, attackerId, assetId, profit);
		scenario.scenario.id = modelId.replace(/-model$/i, '-scenario');
		const scenarioXmlStr = trespassModel.scenarioToXML(scenario);
		// console.log(scenarioXmlStr);

		// upload to knowledgebase
		putModelAndScenarioIntoKnowledgebase(
			modelId,
			{
				fileType: 'model_file',
				fileName: modelFileName,
				fileContent: modelXmlStr
			},
			{
				fileType: 'scenario_file',
				fileName: scenarioFileName,
				fileContent: scenarioXmlStr
			}
		);

		// zip it!
		let zip = new JSZip();
		zip.file(modelFileName, modelXmlStr);
		zip.file(scenarioFileName, scenarioXmlStr);
		const blob = zip.generate({ type: 'blob' });

		if (downloadScenario) {
			// download it
			const saveAs = require('browser-saveas');
			saveAs(blob, 'scenario.zip');
		}

		// start tool chain
		let formData = new FormData();
		formData.append('file', blob, zipFileName);
		const params = _.merge(
			{
				dataType: 'json',
				url: api.makeUrl(toolsApi, 'secured/tool-chain/'+toolChainId+'/run'),
				data: formData,
			},
			api.requestOptions.jquery.crossDomain,
			api.requestOptions.jquery.withCredentials,
			api.requestOptions.jquery.fileUpload
		);
		const req = $.ajax(params);

		// wait for it to finish
		Q(req) // TODO: make this reusable, as part of trespass.api
			.then((runData) => {
				if (runData.error) {
					alert(runData.error);
					console.error(runData.error);
					return;
				}

				console.log(runData);
				const taskId = runData.id;

				// then, wait for result to become available:
				const url = api.makeUrl(toolsApi, `secured/task/${taskId}/status`);
				// const url = api.makeUrl(toolsApi, 'secured/task/'+taskId);
				const params = _.merge(
					{ url, dataType: 'json' },
					api.requestOptions.jquery.crossDomain,
					api.requestOptions.jquery.withCredentials
				);
				const retryRate = 1000;
				const intervalId = setInterval(function() {
					Q($.ajax(params))
						.then(function(taskData) {
							switch (taskData.status) {
								case 'error':
								case 'rejected':
								case 'task_not_found':
								case 'app_not_found': {
									clearInterval(intervalId);
									alert(taskData.status);
									console.error(taskData);
									break;
								}

								case 'abort': {
									clearInterval(intervalId);
									break;
								}

								case 'pending':
								case 'processing': {
									// do nothing
									break;
								}

								case 'done': {
									clearInterval(intervalId);
									console.log(taskData);
									// TODO:
									// dispatch({
									// 	type: constants.API_UPDATE_TASK_DATA,
									// 	taskData: _.merge(taskData, { error: null })
									// });
									break;
								}

								default: {
									clearInterval(intervalId);
									// TODO: what?
									break;
								}
							}
						});
				}, retryRate);
			})
			.catch(handleError);


		dispatch({
			type: constants.ACTION_runAnalysis,
			toolChainId
		});
	};
};


const loadToolChains =
module.exports.loadToolChains =
function loadToolChains(xmlString) {
	return function(dispatch, getState) {
		// dispatch({ type: constants.ACTION_loadToolChains });

		const params = _.merge(
			{
				dataType: 'json',
				url: api.makeUrl(toolsApi, 'secured/tool-chain'),
				// data: data,
			},
			api.requestOptions.jquery.crossDomain,
			api.requestOptions.jquery.withCredentials
		);
		const req = $.ajax(params);
		Q(req)
			.then(function(chains) {
				// only get those chains that begin with treemaker
				const treemakerName = 'Treemaker'; // TODO: don't hardcode
				const toolChains = chains
					.filter((toolChain) => {
						return toolChain.tools[0].name === treemakerName;
					});
				dispatch({
					type: constants.ACTION_loadToolChains_DONE,
					toolChains
				});
			})
			.catch(handleError);
	};
};


const loadAttackerProfiles =
module.exports.loadAttackerProfiles =
function loadAttackerProfiles() {
	return function(dispatch, getState) {
		// dispatch({ type: constants.ACTION_loadAttackerProfiles });

		const url = api.makeUrl(knowledgebaseApi, 'attackerprofile');
		const params = _.merge(
			{ url, dataType: 'json' },
			api.requestOptions.jquery.crossDomain
		);

		const req = $.ajax(params);
		Q(req)
			.then(function(attackerProfiles) {
				dispatch({
					type: constants.ACTION_loadAttackerProfiles_DONE,
					attackerProfiles
				});
			})
			.catch(handleError);
	};
};


const loadModelPatterns =
module.exports.loadModelPatterns =
function loadModelPatterns() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadModelPatterns });

		const url = fakeApiUrl(fakeApi.api.patterns.url);
		const params = _.merge(
			{ url, dataType: 'json' },
			api.requestOptions.jquery.crossDomain
		);

		const req = $.ajax(params);
		Q(req)
			.then((modelPatterns) => {
				dispatch({
					type: constants.ACTION_loadModelPatterns_DONE,
					modelPatterns: modelPatterns.list
				});
			})
			.catch(handleError);
	};
};


const loadRelationTypes =
module.exports.loadRelationTypes =
function loadRelationTypes() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadRelationTypes });

		const {serverDomain, serverPort} = fakeApi;
		const url = `http://${serverDomain}:${serverPort}${fakeApi.api.relations.url}`;
		const req = $.ajax({
			url,
			dataType: 'json',
		})

		Q(req)
			.then(function(data) {
				dispatch({
					type: constants.ACTION_loadRelationTypes_DONE,
					relationTypes: data.list
				});
			})
			.catch(handleError);
	};
};


const loadComponentTypes =
module.exports.loadComponentTypes =
function loadComponentTypes() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadComponentTypes });

		const url = api.makeUrl(knowledgebaseApi, 'type');
		const params = _.merge(
			{ url, dataType: 'json' },
			api.requestOptions.jquery.crossDomain
		);

		const req = $.ajax(params);
		Q(req)
			.then((types) => {
				const componentTypes = types
					.map((type) => {
						return {
							id: type['@id'],
							kbType: type['@id'],
							label: type['@label'],
							modelComponentType: type['tkb:tml_class'],

							attributes: type['tkb:has_attribute']
								.reduce((acc, attr) => {
									return [...acc, {
										id: attr['@id'],
										label: attr['@label'],
										values: attr['tkb:values'],
									}];
								}),

							// TODO: rest
						};
					});
				dispatch({
					type: constants.ACTION_loadComponentTypes_DONE,
					componentTypes
				});
			})
			.catch(handleError);
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

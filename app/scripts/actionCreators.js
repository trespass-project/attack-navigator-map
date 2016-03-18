'use strict';

const $ = require('jquery');
const Q = require('q');
require('whatwg-fetch');
const R = require('ramda');
const _ = require('lodash');
const JSZip = require('jszip');
const saveAs = require('browser-saveas');
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
	return `http://${serverDomain}:${serverPort}${url}`;
}


const noop = () => {};


// let requests = {};
// function abortRequests(requests, key) {
// 	requests[key] = requests[key] || [];
// 	requests[key].forEach((req) => { req.abort(); });
// 	requests[key].length = 0;
// }


function handleError(err) {
	if (err.statusText === 'abort') { return; }
	console.error(err.stack);
}

// ——————————


const initMap =
module.exports.initMap =
function initMap(modelId=undefined, cb=noop) {
	return (dispatch, getState) => {
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
					cb();
				},

				// handleMissing
				(modelId) => {
					// ... otherwise create it
					dispatch( kbCreateModel(modelId, cb) );
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

	return (dispatch, getState) => {
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
function kbCreateModel(modelId, cb=noop) {
	// TODO: only create model, once model/graph is not empty anymore.
	// otherwise we might be creatings tons of empty ones ...

	if (!modelId) {
		console.error('no model id provided');
		return;
	}

	return (dispatch, getState) => {
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
					cb();
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
	return (dispatch, getState) => {
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
		dispatch( importFragment(fragment, modelXY) );
	};
};


const importFragment =
module.exports.importFragment =
function importFragment(fragment, xy) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_importFragment,
			fragment,
			xy
		});
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


const resetTransformation =
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
	return (dispatch, getState) => {
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
function setDragNode(nodeId) {
	return {
		type: constants.ACTION_setDragNode,
		nodeId
	};
};


module.exports.setHoverNode =
function setHoverNode(nodeId) {
	return {
		type: constants.ACTION_setHoverNode,
		nodeId
	};
};


module.exports.setHoverGroup =
function setHoverGroup(groupId) {
	return {
		type: constants.ACTION_setHoverGroup,
		groupId
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


// module.exports.addNode =
// function addNode(node) {
// 	return {
// 		type: constants.ACTION_addNode,
// 		node
// 	};
// };


module.exports.cloneNode =
function cloneNode(nodeId) {
	return {
		type: constants.ACTION_cloneNode,
		nodeId
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
function removeNode(nodeId) {
	return {
		type: constants.ACTION_removeNode,
		nodeId
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
function ungroupNode(nodeId) {
	return {
		type: constants.ACTION_ungroupNode,
		nodeId
	};
};


module.exports.moveGroup =
function moveGroup(groupId, posDelta) {
	return {
		type: constants.ACTION_moveGroup,
		groupId,
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
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_loadXMLFile,
			file,
		});

		dispatch(
			resetTransformation()
		);

		// ———

		let reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target.result;
			dispatch( loadXML(content) );
		};
		reader.readAsText(file);
	};
};


const loadXML =
module.exports.loadXML =
function loadXML(xmlString) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_loadXML,
			xml: xmlString,
		});

		modelHelpers.XMLModelToGraph(xmlString, (err, result) => {
			if (err) { return; }

			result.graph = modelHelpers.layoutGraphByType(result.graph);

			dispatch(
				initMap(result.metadata.id)
			);
			dispatch({
				type: constants.ACTION_loadXML_DONE,
				result
			});
		});
	};
};


const getXMLBlob =
module.exports.getXMLBlob =
function getXMLBlob(xmlStr) {
	return new Blob(
		[xmlStr],
		{ type: 'text/plain;charset=utf-8' }
	);
};


const downloadModelXML =
module.exports.downloadModelXML =
function downloadModelXML() {
	return (dispatch, getState) => {
		const state = getState();
		const model = modelHelpers.modelFromGraph(state.model.graph, state.model.metadata);
		const modelXmlStr = trespassModel.toXML(model);
		const modelFileName = `${model.system.title.replace(/\s/g, '-')}.xml`;
		saveAs(getXMLBlob(modelXmlStr), modelFileName);
	};
};


const downloadZippedScenario =
module.exports.downloadZippedScenario =
function downloadZippedScenario() {
	return (dispatch, getState) => {
		const state = getState();
		const model = modelHelpers.modelFromGraph(state.model.graph, state.model.metadata);
		const modelId = model.system.id;
		const modelXmlStr = trespassModel.toXML(model);

		const modelFileName = 'model.xml';
		const scenarioFileName = 'scenario.xml';
		const zipFileName = 'scenario.zip';

		const scenarioXmlStr = generateScenarioXML(
			modelId,
			modelFileName,
			state.interface
		);

		const zipBlob = zipScenario(
			modelXmlStr,
			modelFileName,
			scenarioXmlStr,
			scenarioFileName
		);
		saveAs(zipBlob, zipFileName);
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
function removeEdge(edgeId) {
	return {
		type: constants.ACTION_removeEdge,
		edgeId
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


const setAttackerActor =
module.exports.setAttackerActor =
function setAttackerActor(actorId) {
	return {
		type: constants.ACTION_setAttackerActor,
		actorId
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


function kbRunToolchain(toolChainId=1, modelId, attackerProfileId) {
	const url = `${api.makeUrl(knowledgebaseApi, 'runTools')}/${toolChainId}?model_id=${modelId}&attackerprofile_id=${attackerProfileId}`;

	const params = _.merge(
		{
			headers: {
				'Accept': 'application/json',
				// 'Content-Type': 'application/json'
			},
		},
		api.requestOptions.fetch.crossDomain
	);

	return fetch(url, params)
		.catch((err) => {
			alert(err);
			console.error(err);
		})
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			// TODO: do s.th.
			console.log(data);
		});
}


const generateScenarioXML =
module.exports.generateScenarioXML =
function generateScenarioXML(
	modelId, modelFileName,
	{ attackerActorId, attackerGoal, attackerGoalType, attackerProfit }
) {
	const attackerId = attackerActorId || 'X';
	const assetId = attackerGoal[attackerGoalType].asset;
	const profit = attackerProfit;
	let scenario = trespassModel.createScenario();
	scenario = trespassModel.scenarioSetModel(scenario, modelFileName);
	scenario = trespassModel.scenarioSetAssetGoal(scenario, attackerId, assetId, profit);
	scenario.scenario.id = modelId.replace(/-model$/i, '-scenario');
	return trespassModel.scenarioToXML(scenario);
};


const zipScenario =
module.exports.zipScenario =
function zipScenario(modelXmlStr, modelFileName, scenarioXmlStr, scenarioFileName) {
	const zip = new JSZip();
	zip.file(modelFileName, modelXmlStr);
	zip.file(scenarioFileName, scenarioXmlStr);
	return zip.generate({ type: 'blob' });
};


const setSelectedToolChain =
module.exports.setSelectedToolChain =
function setSelectedToolChain(toolChainId) {
	return {
		type: constants.ACTION_setSelectedToolChain,
		toolChainId
	};
};


const runAnalysis =
module.exports.runAnalysis =
function runAnalysis(toolChainId, downloadScenario=false) {
	return function(dispatch, getState) {
		const state = getState();
		const toolChains = state.interface.toolChains;
		const toolChainData = toolChains[toolChainId];

		if (!toolChainData) {
			throw new Error('Tool chain not found.');
			return;
		}

		const modelId = state.model.metadata.id;
		if (!modelId) {
			throw new Error('missing model id');
		}

		const model = modelHelpers.modelFromGraph(state.model.graph, state.model.metadata);
		const modelXmlStr = trespassModel.toXML(model);

		const modelFileName = 'model.xml';
		const scenarioFileName = 'scenario.xml';
		const zipFileName = 'scenario.zip';

		const scenarioXmlStr = generateScenarioXML(
			modelId,
			modelFileName,
			state.interface
		);

		// download
		if (downloadScenario) {
			const zipBlob = zipScenario(
				modelXmlStr,
				modelFileName,
				scenarioXmlStr,
				scenarioFileName
			);
			saveAs(zipBlob, zipFileName);
		}

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
		)
			.then(() => {
				const toolChainId = 1;
				kbRunToolchain(toolChainId, modelId, state.interface.attackerProfile.id);
			});

		// // start tool chain
		// const formData = new FormData();
		// formData.append('file', blob, zipFileName);
		// const params = {
		// 	method: 'post',
		// 	body: formData
		// };
		// const callbacks = {
		// 	// onToolChainStart: () => {},
		// 	// onToolChainEnd: () => {},
		// 	onToolStart: (toolData) => {
		// 		console.log('————————————————————');
		// 		console.log(toolData.name);
		// 	},
		// 	// onToolEnd: (toolData) => {
		// 	// 	console.log('onToolEnd', toolData.name);
		// 	// },
		// 	onTaskStatus: (taskStatusData) => {
		// 		console.log('  ', taskStatusData.status);
		// 	},
		// }
		// toolsApi.runToolChain(fetch, toolChainData, callbacks, params)
		// 	.then((data) => {
		// 		console.log('->', data);
		// 	})
		// 	.catch((err) => {
		// 		console.error(err.stack);
		// 	});

		dispatch({
			type: constants.ACTION_runAnalysis,
			toolChainId
		});
	};
};


const loadToolChains =
module.exports.loadToolChains =
function loadToolChains(xmlString) {
	return (dispatch, getState) => {
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
			.then((chains) => {
				// only get those chains that begin with treemaker
				const treemakerName = 'Treemaker'; // TODO: don't hardcode
				const toolChains = chains
					.filter((toolChain) => {
						return toolChain.tools[0].name === treemakerName;
					});
				dispatch({
					type: constants.ACTION_loadToolChains_DONE,
					normalizedToolChains: helpers.normalize(toolChains)
				});
			})
			.catch(handleError);
	};
};


const loadAttackerProfiles =
module.exports.loadAttackerProfiles =
function loadAttackerProfiles() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadAttackerProfiles });

		const state = getState();
		const modelId = state.model.metadata.id;
		const url = api.makeUrl(knowledgebaseApi, `attackerprofile?model_id=${modelId}`);
		const params = _.merge(
			{ url, dataType: 'json' },
			api.requestOptions.jquery.crossDomain
		);

		const req = $.ajax(params);
		Q(req)
			.then((attackerProfiles) => {
				dispatch({
					type: constants.ACTION_loadAttackerProfiles_DONE,
					normalizedAttackerProfiles: helpers.normalize(attackerProfiles)
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
			.then((data) => {
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

		const state = getState();
		const modelId = state.model.metadata.id;
		const url = api.makeUrl(knowledgebaseApi, `type?model_id=${modelId}`);
		const params = _.merge(
			{ url, dataType: 'json' },
			api.requestOptions.jquery.crossDomain
		);

		const req = $.ajax(params);
		Q(req)
			.then((types) => {
				const kbTypeAttributes = types
					.reduce((acc, type) => {
						acc[type['@id']] = type['tkb:has_attribute']
							.reduce((attributes, attr) => {
								return [...attributes, {
									id: attr['@id'],
									label: attr['@label'],
									values: (!attr['tkb:mvalues'])
										? null
										: attr['tkb:mvalues']['@list'],
								}];
							}, [])
						return acc;
					}, {});

				const componentsLib = types
					.map((type) => {
						const id = type['@id'];
						const modelComponentType = type['tkb:tml_class'];
						return {
							id,
							modelComponentType,
							type: id,
							label: type['@label'],
							// TODO: rest
						};
					});

				dispatch({
					type: constants.ACTION_loadComponentTypes_DONE,
					kbTypeAttributes,
					componentsLib,
				});
			})
			.catch(handleError);
	};
};


// ——————————
/*
module.exports.openDir =
function openDir(dirName) {
	return (dispatch, getState) => {
		Q().then(() => {
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

const isNodeEnvironment = require('detect-node');
const $ = require('jquery');
const Q = require('q');
const R = require('ramda');
const _ = require('lodash');
const JSZip = require('jszip');
const saveAs = require('browser-saveas');
// require('whatwg-fetch');
const queryString = require('query-string');
const trespass = require('trespass.js');
const trespassModel = trespass.model;
const api = trespass.api;
// const toolsApi = api.tools;
const knowledgebaseApi = api.knowledgebase;
const constants = require('./constants.js');
const modelHelpers = require('./model-helpers.js');
const helpers = require('./helpers.js');

const modelPatternLib = require('./pattern-lib.js');
const relationsLib = require('./relation-lib.js');


const noop = () => {};
const retryRate = 1000;


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


/**
 * initialize map
 * @returns {Promise}
 */
const initMap =
module.exports.initMap =
function initMap(modelId=undefined) {
	return (dispatch, getState) => {
		// create model, if necessary
		return kbGetModelOrCreate(modelId)
			.then((modelId) => {
				// set model id
				dispatch({
					type: constants.ACTION_initMap,
					modelId
				});

				// reset view
				dispatch( resetTransformation() );
			})
			.then(() => {
				// load model-specific stuff from knowledgebase
				dispatch( loadComponentTypes() );
				dispatch( loadAttackerProfiles() );
				dispatch( loadToolChains() );
			})
			.then(() => {
				// fake api
				dispatch( loadModelPatterns() );
				dispatch( loadRelationTypes() );
			});
	};
};


/**
 * creates a new model in the knowledgebase
 * @returns {Promise} - modelId
 */
const kbGetModelOrCreate =
module.exports.kbGetModelOrCreate =
function kbGetModelOrCreate(modelId) {
	if (!modelId) {
		console.warn('no model id provided – creating new one.');
		return kbCreateModel();
	}

	return kbGetModel(modelId)
		.then((modelId) => {
			const doesExist = !!modelId;
			if (doesExist) {
				return Promise.resolve(modelId);
			} else {
				console.warn('model does not exist – creating new one.');
				return kbCreateModel();
			}
		})
		.catch((err) => {
			console.error(err);
		});
};


/**
 * gets a model from the knowledgebae
 * @returns {Promise} - modelId or null, if model doesn't exist
 */
const kbGetModel =
module.exports.kbGetModel =
function kbGetModel(modelId) {
	return new Promise((resolve, reject) => {
		if (!modelId) {
			return reject('no model id provided');
		}

		const url = api.makeUrl(knowledgebaseApi, `model/${modelId}`);
		const params = _.merge(
			{ url },
			api.requestOptions.jquery.acceptJSON,
			api.requestOptions.jquery.crossDomain
		);

		$.ajax(params)
			.done((model, textStatus, xhr) => {
				resolve(modelId);
			})
			.fail((xhr, textStatus, err) => {
				if (xhr.status === 404) {
					resolve(null); // model does not exist
				} else {
					reject(`something went wrong: ${xhr.status}`);
				}
			});
	});
};


/**
 * creates a new model in the knowledgebase.
 * @returns {Promise} - modelId
 */
const kbCreateModel =
module.exports.kbCreateModel =
function kbCreateModel() {
	const modelId = helpers.makeId('model');

	return new Promise((resolve, reject) => {
		knowledgebaseApi.createModel($.ajax, modelId)
			.fail((xhr, textStatus, err) => {
				reject();
			})
			.done((data, textStatus, xhr) => {
				if (xhr.status === 200) {
					resolve(modelId);
				} else {
					console.error(`something went wrong: ${xhr.status}`);
					reject();
				}
			});
	});
};


const kbCreateItem =
module.exports.kbCreateItem =
function kbCreateItem(modelId, item) {
	// console.log('creating', item);

	if (!modelId) {
		console.error('no model id provided');
		return;
	}

	// knowledgebaseApi.createItem(fetch, modelId, item)
	// 	.catch((err) => {
	// 		console.error(err.stack);
	// 	})
	// 	.then((res) => {
	// 		if (res.status === 200) {
	// 			// knowledgebaseApi.getItem(fetch, modelId, item.id)
	// 			// 	.catch((err) => {
	// 			// 		console.error(err.stack);
	// 			// 	})
	// 			// 	.then((res) => {
	// 			// 		return res.json();
	// 			// 	})
	// 			// 	.then((data) => {
	// 			// 		return console.log(data);
	// 			// 	});
	// 		} else {
	// 			console.error(`something went wrong: ${res.status}`);
	// 		};
	// 	});

	knowledgebaseApi.createItem($.ajax, modelId, item)
		.fail((xhr, textStatus, err) => {
			console.error(err.stack);
		})
		.done((data, textStatus, xhr) => {
			if (xhr.status === 200) {
				//
			} else {
				console.error(`something went wrong: ${xhr.status}`);
			}
		});
};


const kbDeleteItem =
module.exports.kbDeleteItem =
function kbDeleteItem(modelId, itemId) {
	// console.log('deleting', itemId);

	if (!modelId) {
		console.error('no model id provided');
		return;
	}

	// knowledgebaseApi.deleteItem(fetch, modelId, itemId)
	// 	.catch((err) => {
	// 		console.error(err.stack);
	// 	})
	// 	.then((res) => {
	// 		if (res.status === 200) {
	// 			// TODO: ?
	// 		} else {
	// 			console.error(`something went wrong: ${res.status}`);
	// 		};
	// 	});
	knowledgebaseApi.deleteItem($.ajax, modelId, itemId)
		.fail((xhr, textStatus, err) => {
			console.error(err.stack);
		})
		.done((data, textStatus, xhr) => {
			if (xhr.status === 200) {
				// TODO: ?
			} else {
				console.error(`something went wrong: ${xhr.status}`);
			}
		});
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
			xy,
			cb: (modelId, importedNodes) => {
				importedNodes
					.forEach((node) => {
						kbCreateItem(modelId, node);
					});
			}
		});
	};
};


const select =
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
	return (dispatch, getState) => {
		if (!isNodeEnvironment) {
			// TODO: make kb call
		}

		dispatch({
			type: constants.ACTION_removeNode,
			nodeId,
			cb: kbDeleteItem
		});
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


const loadModelFile =
module.exports.loadModelFile =
function loadModelFile(file) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_loadModelFile,
			file,
		});

		// ———

		const reader = new FileReader();
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

		modelHelpers.xmlModelToGraph(xmlString, (err, result) => {
			if (err) {
				console.error(err.stack);
				return;
			}

			// auto-layout graph
			result.graph = modelHelpers.layoutGraphByType(result.graph);

			// use existing model id, or create new one
			result.metadata.id = result.metadata.id || helpers.makeId('model');

			dispatch(
				initMap(result.metadata.id, () => {
					dispatch(
						importFragment(result.graph)
					);
				})
			);

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


function replaceIdsInString(str, idReplacementMap={}) {
	return R.keys(idReplacementMap)
		.reduce((acc, oldId) => {
			const re = new RegExp(oldId, 'g');
			return acc.replace(re, idReplacementMap[oldId]);
		}, str);
}


function stateToHumanReadableModelXML(state) {
	const idReplacementMap = ['nodes', ...modelHelpers.collectionNames]
		.reduce((acc, collName) => {
			if (state.model.graph[collName]) {
				const coll = state.model.graph[collName];
				R.keys(coll)
					.forEach(id => {
						const newId = `${coll[id].modelComponentType}__${(coll[id].label || id).replace(/ +/g, '-')}`;
						acc[id] = newId;
					});
			}
			return acc;
		}, {});

	const model = modelHelpers.modelFromGraph(
		state.model.graph,
		state.model.metadata
	);
	let modelXmlStr = trespassModel.toXML(model);

	// HACK: replace all ids with their human-readable versions
	modelXmlStr = replaceIdsInString(modelXmlStr, idReplacementMap);

	return { modelXmlStr, model, idReplacementMap };
}


function stateToHumanReadableScenarioXML(state, modelId, modelFileName, idReplacementMap={}) {
	let scenarioXmlStr = generateScenarioXML(
		modelId,
		modelFileName,
		state.interface
	);

	// HACK: replace all ids with their human-readable versions
	scenarioXmlStr = replaceIdsInString(scenarioXmlStr, idReplacementMap);

	return scenarioXmlStr;
}


const downloadModelXML =
module.exports.downloadModelXML =
function downloadModelXML() {
	return (dispatch, getState) => {
		const state = getState();
		const { modelXmlStr, model } = stateToHumanReadableModelXML(state);
		const modelFileName = `${model.system.title.replace(/\s/g, '-')}.xml`;
		saveAs(getXMLBlob(modelXmlStr), modelFileName);
	};
};


const downloadZippedScenario =
module.exports.downloadZippedScenario =
function downloadZippedScenario() {
	return (dispatch, getState) => {
		const state = getState();
		const { modelXmlStr, model, idReplacementMap } = stateToHumanReadableModelXML(state);
		const modelId = model.system.id;

		const modelFileName = 'model.xml';
		const scenarioFileName = 'scenario.xml';
		const zipFileName = 'scenario.zip';

		const scenarioXmlStr = stateToHumanReadableScenarioXML(
			state,
			modelId,
			modelFileName,
			idReplacementMap
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
	return (dispatch, getState) => {
		let edgeId;
		dispatch({
			type: constants.ACTION_addEdge,
			edge,
			cb: (_edgeId) => {
				edgeId = _edgeId;
			}
		});
		// console.log(edgeId);
		dispatch(
			select(edgeId, 'edge')
		);
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
		groupId, removeNodes,
		cb: kbDeleteItem
	};
};


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(componentId, graphComponentType, newProperties) {
	return {
		type: constants.ACTION_updateComponentProperties,
		componentId, graphComponentType, newProperties,
		cb: kbCreateItem
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


module.exports.addProcess =
function addProcess(process) {
	return {
		type: constants.ACTION_addProcess,
		process
	};
};


module.exports.addPolicy =
function addPolicy(policy) {
	return {
		type: constants.ACTION_addPolicy,
		policy
	};
};


module.exports.addPredicate =
function addPredicate(predicate) {
	return {
		type: constants.ACTION_addPredicate,
		predicate
	};
};


const predicateChanged =
module.exports.predicateChanged =
function predicateChanged(predicateId, newProperties) {
	return {
		type: constants.ACTION_predicateChanged,
		predicateId, newProperties
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
			// const params = _.merge(
			// 	{
			// 		method: 'put',
			// 		body: item.data
			// 	},
			// 	api.requestOptions.fetch.acceptJSON,
			// 	api.requestOptions.fetch.crossDomain
			// );
			const params = _.merge(
				{
					url,
					method: 'put',
					data: item.data,
					contentType: 'text/xml',
				},
				api.requestOptions.jquery.acceptPlainText,
				// api.requestOptions.jquery.acceptJSON,
				api.requestOptions.jquery.crossDomain
			);

			return () => {
				console.log(item.query);
				// return fetch(url, params)
				// 	.catch((err) => {
				// 		console.error(err.stack);
				// 	})
				// 	.then((res) => {
				// 		if (res.status === 200) {
				// 			// console.log('success (200)', url);
				// 		} else {
				// 			console.error(`something went wrong (${res.status})`, url);
				// 		}
				// 	});
				return Q($.ajax(params));
					// .fail((xhr, textStatus, err) => {
					// 	console.error(err.stack);
					// })
					// .catch((err) => {
					// 	console.error(err.stack);
					// })
					// .then((toolChains, textStatus, xhr) => {
					// 	console.log(arguments);
					// 	if (xhr.status === 200) {
					// 		// console.log('success (200)', url);
					// 	} else {
					// 		console.error(`something went wrong (${xhr.status})`, url);
					// 	}
					// });
			};
		});

	// const resolved = Promise.resolve();
	const deferred = Q.defer();
	const promise = taskFuncs
		.reduce((acc, taskFunc) => {
			return acc
				.then(taskFunc)
				.catch((err) => {
					console.dir(err);
					console.error(err.stack);
				});
		}, deferred.promise /*resolved*/)
		.catch((err) => {
			console.error(err.stack);
		});
	deferred.resolve();

	return promise;
};


function monitorTaskStatus(taskUrl, _callbacks={}) {
	const callbacks = _.defaults(_callbacks, {
		onTaskStatus: noop,
	});

	const url = taskUrl;
	// const params = _.merge(
	// 	api.requestOptions.fetch.acceptJSON,
	// 	api.requestOptions.fetch.crossDomain
	// );
	const params = _.merge(
		{ url },
		api.requestOptions.jquery.acceptJSON,
		api.requestOptions.jquery.contentTypeJSON,
		api.requestOptions.jquery.crossDomain
	);

	return new Promise((resolve, reject) => {
		let intervalId;

		function check() {
			// fetch(url, params)
			// 	.catch((err) => {
			// 		console.error(err.stack);
			// 		clearInterval(intervalId);
			// 		reject(err);
			// 	})
			// 	.then((res) => {
			// 		return res.json();
			// 	})
			// 	.then((taskStatusData) => {
			// 		if (taskStatusData.status) {
			// 			const taskStatusDataCategorized = helpers.handleStatus(taskStatusData);
			// 			if (taskStatusDataCategorized.current[0]) {
			// 				console.warn(taskStatusDataCategorized.current[0].name, taskStatusData.status);
			// 			}
			// 			callbacks.onTaskStatus(taskStatusDataCategorized);

			// 			switch (taskStatusData.status) {
			// 				case 'not started':
			// 				case 'running':
			// 					// do nothing
			// 					break;

			// 				case 'error':
			// 					clearInterval(intervalId);
			// 					const errorMessage = taskStatusDataCategorized.current[0]['error-message'];
			// 					alert(errorMessage);
			// 					console.error(errorMessage);
			// 					break;

			// 				case 'done':
			// 					clearInterval(intervalId);
			// 					callbacks.onToolChainEnd(taskStatusData);
			// 					break;

			// 				default:
			// 					clearInterval(intervalId);
			// 					reject(new Error(`Unknown status: ${taskStatusData.status}`));
			// 					break;
			// 			}
			// 		}
			// 	});
			$.ajax(params)
				.fail((xhr, textStatus, err) => {
					console.error(err.stack);
					clearInterval(intervalId);
					reject(err);
					console.error(err.stack);
				})
				.done((taskStatusData, textStatus, xhr) => {
					if (taskStatusData.status) {
						const taskStatusDataCategorized = helpers.handleStatus(taskStatusData);
						if (taskStatusDataCategorized.current[0]) {
							console.warn(taskStatusDataCategorized.current[0].name, taskStatusData.status);
						}
						callbacks.onTaskStatus(taskStatusDataCategorized);

						switch (taskStatusData.status) {
							case 'not started':
							case 'running':
								// do nothing
								break;

							case 'error':
								clearInterval(intervalId);
								const errorMessage = taskStatusDataCategorized.current[0]['error-message'];
								alert(errorMessage);
								console.error(errorMessage);
								break;

							case 'done':
								clearInterval(intervalId);
								callbacks.onToolChainEnd(taskStatusData);
								break;

							default:
								clearInterval(intervalId);
								reject(new Error(`Unknown status: ${taskStatusData.status}`));
								break;
						}
					}
				});
		}

		intervalId = setInterval(check, retryRate);
	});
}


const setAnalysisRunning =
module.exports.setAnalysisRunning =
function setAnalysisRunning(yesno) {
	return {
		type: constants.ACTION_setAnalysisRunning,
		yesno
	};
};


const setAnalysisResults =
module.exports.setAnalysisResults =
function setAnalysisResults(analysisResults) {
	return {
		type: constants.ACTION_setAnalysisResults,
		analysisResults
	};
};


function handleError(err) {
	console.error(err.stack);
	alert(err);
}


function kbRunToolchain(toolChainId, modelId, attackerProfileId, callbacks={}) {
	// knowledgebaseApi.runToolChain(fetch, modelId, toolChainId, attackerProfileId, callbacks)
	// 	.then((res) => {
	// 		return res.json();
	// 	})
	// 	.then((data) => {
	// 		// console.log(data);
	// 		monitorTaskStatus(data.task_url, callbacks);
	// 	});
	knowledgebaseApi.runToolChain($.ajax, modelId, toolChainId, attackerProfileId, callbacks)
		.done((data, textStatus, xhr) => {
			// console.log(data);
			monitorTaskStatus(data.task_url, callbacks);
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


const setTaskStatusCategorized =
module.exports.setTaskStatusCategorized =
function setTaskStatusCategorized(taskStatusDataCategorized) {
	return {
		type: constants.ACTION_setTaskStatusCategorized,
		taskStatusCategorized: taskStatusDataCategorized
	};
};


const retrieveAnalysisResults =
module.exports.retrieveAnalysisResults =
function retrieveAnalysisResults(taskStatusData) {
	const analysisTools = ['A.T. Analyzer', 'A.T. Evaluator'];
	const tools = taskStatusData.tool_status
		.filter(toolStatus => R.contains(toolStatus.name, analysisTools));

	const promises = tools
		.map((tool) => {
			// const params = _.merge(
			// 	{ method: 'get' },
			// 	// api.requestOptions.fetch.acceptJSON,
			// 	api.requestOptions.fetch.crossDomain
			// );
			// return fetch(tool.result_file_url, params)
			// 	.then((res) => {
			// 		return res.blob();
			// 	})
			// 	.then((blob) => {
			// 		return {
			// 			name: tool.name,
			// 			blob,
			// 		};
			// 	});
			const params = _.merge(
				{
					url: tool.result_file_url,
					method: 'get'
				},
				// api.requestOptions.jquery.acceptJSON,
				// api.requestOptions.jquery.contentTypeJSON,
				api.requestOptions.jquery.crossDomain
			);
			return $.ajax(params)
				.done((blob, textStatus, xhr) => {
					console.dir(blob);
					return {
						name: tool.name,
						blob,
					};
				});
		});

	return Promise.all(promises)
		.catch((err) => {
			console.error(err.stack);
		})
		.then((items) => {
			console.log(items);
			return items
				.reduce((acc, item) => {
					acc[item.name] = item;
					return acc;
				}, {});
		});
};


const runAnalysis =
module.exports.runAnalysis =
function runAnalysis(toolChainId, downloadScenario=false) {
	return function(dispatch, getState) {
		const state = getState();
		console.log(state.model.graph);
		const toolChains = state.interface.toolChains;
		const toolChainData = toolChains[toolChainId];

		if (!toolChainData) {
			throw new Error('Tool chain not found.');
		}

		const modelId = state.model.metadata.id;
		if (!modelId) {
			throw new Error('missing model id');
		}

		const { modelXmlStr, model, idReplacementMap } = stateToHumanReadableModelXML(state);

		const validationErrors = trespass.model.validateModel(model);
		if (validationErrors.length) {
			alert([
				'Model validation failed:',
				...(validationErrors.map(R.prop('message')))
			].join('\n'));
			return;
		}

		const modelFileName = 'model.xml';
		const scenarioFileName = 'scenario.xml';
		const zipFileName = 'scenario.zip';

		const scenarioXmlStr = stateToHumanReadableScenarioXML(
			state,
			modelId,
			modelFileName,
			idReplacementMap
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
				const callbacks = {
					// onToolChainStart: () => {
					// 	console.log('onToolChainStart');
					// },
					onToolChainEnd: (taskStatusData) => {
						console.log('done', taskStatusData);
						retrieveAnalysisResults(taskStatusData)
							.then(result => {
								const promises = R.values(result)
									.map((item) => {
										return new Promise((resolve, reject) => {
											function done(contents) {
												resolve({ [item.name]: contents });
											}

											function textHandler(e) {
												const content = e.target.result;
												done([content]);
											}

											function zipHandler(e) {
												const zip = new JSZip(e.target.result);
												// console.log(zip);
												const re = new RegExp('^ata_output_nr', 'i');

												const contents = R.values(zip.files)
													.filter((file) => {
														// console.log(file.name);
														return re.test(file.name);
													})
													.map((file) => {
														const content = file.asText();
														return content;
													});
												done(contents);
											}

											const blob = item.blob;
											const reader = new FileReader();
											// for what we know, zip blob type could be any of these
											const zipTypes = [
												'application/zip',
												'application/x-zip',
												'application/x-zip-compressed',
												'application/octet-stream',
												'multipart/x-zip',
											];
											if (blob.type === 'text/plain') {
												reader.onload = textHandler;
												reader.readAsText(blob);
											} else if (R.contains(blob.type, zipTypes)) {
												reader.onload = zipHandler;
												reader.readAsArrayBuffer(blob);
											} else {
												console.warn('unexpected mime type', blob.type);
											}
										});
									});

								Promise.all(promises)
									.catch(reason => {
										console.error(reason);
									})
									.then((results) => {
										const analysisResults = results
											.reduce((acc, item) => {
												return _.assign(acc, item);
											}, {});
										console.log('analysis results:', analysisResults);
										dispatch(setAnalysisResults(analysisResults));
									});
							});
					},
					// onToolStart: (toolId) => {
					// 	console.log('onToolStart', toolId);
					// },
					// onToolEnd: (toolId) => {
					// 	console.log('onToolEnd', toolId);
					// },
					onTaskStatus: (taskStatusDataCategorized) => {
						// console.log('onTaskStatus', taskStatusDataCategorized);
						dispatch(
							setTaskStatusCategorized(taskStatusDataCategorized)
						);
					},
				};
				kbRunToolchain(toolChainId, modelId, state.interface.attackerProfile.id, callbacks);
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
function loadToolChains() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadToolChains });

		const state = getState();
		const modelId = state.model.metadata.id;

		const url = api.makeUrl(knowledgebaseApi, `toolchain?model_id=${modelId}`);
		// const params = _.merge(
		// 	{},
		// 	api.requestOptions.fetch.acceptJSON,
		// 	api.requestOptions.fetch.crossDomain
		// );
		// fetch(url, params)
		// 	.catch((err) => {
		// 		console.error(err.stack);
		// 	})
		// 	.then((res) => {
		// 		return res.json();
		// 	})
		// 	.then((toolChains) => {
		// 		// TODO: do they all begin with treemaker?
		// 		dispatch({
		// 			type: constants.ACTION_loadToolChains_DONE,
		// 			normalizedToolChains: helpers.normalize(toolChains)
		// 		});
		// 	});
		const params = _.merge(
			{ url },
			api.requestOptions.jquery.crossDomain,
			api.requestOptions.jquery.acceptJSON,
			api.requestOptions.jquery.contentTypeJSON
		);
		$.ajax(params)
			.fail((xhr, textStatus, err) => {
				console.error(err.stack);
			})
			.done((toolChains, textStatus, xhr) => {
				// TODO: do they all begin with treemaker?
				dispatch({
					type: constants.ACTION_loadToolChains_DONE,
					normalizedToolChains: helpers.normalize(toolChains)
				});
			});
	};
};


// const loadToolChains =
// module.exports.loadToolChains =
// function loadToolChains() {
// 	return (dispatch, getState) => {
// 		// dispatch({ type: constants.ACTION_loadToolChains });

// 		const params = _.merge(
// 			{
// 				dataType: 'json',
// 				url: api.makeUrl(toolsApi, 'secured/tool-chain'),
// 				// data: data,
// 			},
// 			api.requestOptions.jquery.crossDomain,
// 			api.requestOptions.jquery.withCredentials
// 		);
// 		const req = $.ajax(params);
// 		Q(req)
// 			.then((chains) => {
// 				// only get those chains that begin with treemaker
// 				const treemakerName = 'Treemaker'; // TODO: don't hardcode
// 				const toolChains = chains
// 					.filter((toolChain) => {
// 						return toolChain.tools[0].name === treemakerName;
// 					});
// 				dispatch({
// 					type: constants.ACTION_loadToolChains_DONE,
// 					normalizedToolChains: helpers.normalize(toolChains)
// 				});
// 			})
// 			.catch(handleError);
// 	};
// };


const loadAttackerProfiles =
module.exports.loadAttackerProfiles =
function loadAttackerProfiles() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadAttackerProfiles });

		const state = getState();
		const modelId = state.model.metadata.id;
		const url = api.makeUrl(knowledgebaseApi, `attackerprofile?model_id=${modelId}`);
		const params = _.merge(
			{ url },
			api.requestOptions.jquery.acceptJSON,
			api.requestOptions.jquery.contentTypeJSON,
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
		dispatch({
			type: constants.ACTION_loadModelPatterns_DONE,
			modelPatterns: modelPatternLib
		});
	};
};


const loadRelationTypes =
module.exports.loadRelationTypes =
function loadRelationTypes() {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_loadRelationTypes_DONE,
			relationTypes: relationsLib
		});
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

		// TODO: move to trespass.js / fetch
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
							}, []);
						return acc;
					}, {});

				const componentsLib = types
					.map((type) => {
						const id = type['@id'];
						const modelComponentType = type['tkb:tml_class'];
						const _type = {
							id,
							modelComponentType,
							type: id,
							label: type['@label'],
							// TODO: rest
						};
						return _type;
					});

				// the different kb types a model component can be
				const modelComponentTypeToKbTypes = componentsLib
					.reduce((acc, item) => {
						if (!acc[item.modelComponentType]) {
							acc[item.modelComponentType] = [];
						}
						acc[item.modelComponentType].push({
							label: item.label,
							type: item.type,
						});
						return acc;
					}, {});

				dispatch({
					type: constants.ACTION_loadComponentTypes_DONE,
					kbTypeAttributes,
					componentsLib,
					modelComponentTypeToKbTypes
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

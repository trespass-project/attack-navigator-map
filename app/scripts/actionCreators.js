const isNodeEnvironment = require('detect-node');
const $ = require('jquery');
const R = require('ramda');
const _ = require('lodash');
const JSZip = require('jszip');
const saveAs = require('browser-saveas');
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
	alert(err);
}

// ——————————


const getRecentFiles =
module.exports.getRecentFiles =
function getRecentFiles() {
	return (dispatch, getState) => {
		return knowledgebaseApi.listModels($.ajax)
			.fail((xhr, textStatus, err) => {
				if (xhr.status === 0) {
					alert('The knowledgebase doesn\'t appear to be running.');
				}
			})
			.done((models, textStatus, xhr) => {
				dispatch({
					type: constants.ACTION_getRecentFiles,
					models
				});
			});
	};
};


/**
 * initialize map
 * @returns {Promise}
 */
const initMap =
module.exports.initMap =
function initMap(modelId=undefined, metadata=undefined) {
	return (dispatch, getState) => {
		// create model, if necessary
		return getModelOrCreate(modelId)
			.then(({ modelId, isNew=false }) => {
				// set model id
				dispatch({
					type: constants.ACTION_initMap,
					modelId,
					metadata,
				});

				// get data in any case
				dispatch( fetchKbData() );

				// save new model
				if (isNew) {
					dispatch( saveModelToKb() )
						.then(() => {
							// make sure new model shows up in recent files
							dispatch( getRecentFiles() );
						});
				}
			})
			.then(() => {
				// reset view
				dispatch( resetTransformation() );
			});
	};
};


const fetchKbData =
module.exports.fetchKbData =
function fetchKbData() {
	return (dispatch, getState) => {
		// load model-specific stuff from knowledgebase
		dispatch( loadComponentTypes() );
		dispatch( loadAttackerProfiles() );
		dispatch( loadToolChains() );

		dispatch( getRecentFiles() );

		// fake api
		// TODO: should use kb
		dispatch( loadModelPatterns() );
		dispatch( loadRelationTypes() );
	};
};


/**
 * creates a new model in the knowledgebase
 * @returns {Promise} - { modelId, isNew }
 */
const getModelOrCreate =
module.exports.getModelOrCreate =
function getModelOrCreate(_modelId) {
	if (!_modelId) {
		const modelId = helpers.makeId('model');
		console.warn(`no model id provided – creating new one: ${modelId}`);
		return knowledgebaseApi.createModel($.ajax, modelId);
	}

	return knowledgebaseApi.getModel($.ajax, _modelId)
		.then((modelId) => {
			const doesExist = !!modelId;
			if (doesExist) {
				const isNew = false;
				return Promise.resolve({ modelId, isNew });
			} else {
				console.warn(`model does not exist – creating new one with same id: ${_modelId}`);
				return knowledgebaseApi.createModel($.ajax, _modelId);
			}
		})
		.catch((err) => {
			console.error(err.stack);
		});
};


const loadModelFromKb =
module.exports.loadModelFromKb =
function loadModelFromKb(modelId) {
	return (dispatch, getState) => {
		return knowledgebaseApi.getModelFile($.ajax, modelId)
			.then((modelXML) => {
				// console.log(modelXML);
				dispatch( loadXML(modelXML) );
			})
			.catch((jqXHR) => {
				if (jqXHR.status === 404) {
					const message = 'no model file found';
					console.error(message);
					alert(message);
					return;
				}
				console.error(jqXHR.statusText);
				alert(jqXHR.statusText);
			});
	};
};


const saveModelToKb =
module.exports.saveModelToKb =
function saveModelToKb() {
	return (dispatch, getState) => {
		const state = getState();
		const modelId = state.model.metadata.id;
		const model = modelHelpers.modelFromGraph(
			state.model.graph,
			state.model.metadata
		);
		const modelXmlStr = trespassModel.toXML(model);

		return knowledgebaseApi.saveModelFile($.ajax, modelId, modelXmlStr)
			.then(() => {
				console.info('model sent');
			})
			.catch((jqXHR) => {
				console.error(jqXHR.statusText);
				alert(jqXHR.statusText);
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
			xy,
			cb: (modelId, importedNodes) => {
				importedNodes
					.forEach((node) => {
						knowledgebaseApi.createItem($.ajax, modelId, node);
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
			cb: (modelId, itemId) => {
				knowledgebaseApi.deleteItem($.ajax, modelId, itemId);
			}
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

			dispatch( initMap(result.metadata.id || undefined, result.metadata) )
				.then(() => {
					const graph = (result.anmData)
						? result.graph
						: modelHelpers.layoutGraphByType(result.graph);

					// import
					dispatch( importFragment(graph) );
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
	modelXmlStr = helpers.replaceIdsInString(modelXmlStr, idReplacementMap);

	return { modelXmlStr, model, idReplacementMap };
}


function stateToHumanReadableScenarioXML(state, modelId, modelFileName, idReplacementMap={}) {
	let scenarioXmlStr = generateScenarioXML(
		modelId,
		modelFileName,
		state.interface
	);

	// HACK: replace all ids with their human-readable versions
	scenarioXmlStr = helpers.replaceIdsInString(scenarioXmlStr, idReplacementMap);

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
		cb: (modelId, itemId) => {
			knowledgebaseApi.deleteItem($.ajax, modelId, itemId);
		}
	};
};


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(componentId, graphComponentType, newProperties) {
	return {
		type: constants.ACTION_updateComponentProperties,
		componentId, graphComponentType, newProperties,
		cb: (modelId, item) => {
			knowledgebaseApi.createItem($.ajax, modelId, item);
		}
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


function monitorTaskStatus(taskUrl, _callbacks={}) {
	const callbacks = _.defaults(_callbacks, {
		onTaskStatus: noop,
	});

	return new Promise((resolve, reject) => {
		let intervalId;

		function check() {
			knowledgebaseApi.getTaskStatus($.ajax, taskUrl)
				.fail((xhr, textStatus, err) => {
					clearInterval(intervalId);
					console.error(err.stack);
					reject(err);
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
	// a $.ajax()-compatible function that returns blobs
	const binaryAjax =
	module.exports.binaryAjax =
	function binaryAjax(params) {
		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.responseType = 'blob';
			req.open(params.method || 'GET', params.url, true);

			req.onload = (event) => {
				const blob = req.response;
				resolve(blob);
			};

			req.onerror = reject;

			req.send();
		});
	};

	const analysisToolNames = ['A.T. Analyzer', 'A.T. Evaluator'];
	return knowledgebaseApi.getAnalysisResults(binaryAjax, taskStatusData, analysisToolNames)
		.catch((err) => {
			console.error(err.stack);
		})
		.then((items) => {
			console.log(items); // [{ name, blob }]
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
	return (dispatch, getState) => {
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
		Promise.resolve()
			.then(() => {
				return knowledgebaseApi.putFile(
					$.ajax,
					modelId,
					modelXmlStr,
					modelFileName,
					'model_file'
				);
			})
			.then(() => {
				return knowledgebaseApi.putFile(
					$.ajax,
					modelId,
					scenarioXmlStr,
					scenarioFileName,
					'scenario_file'
				);
			})
			.catch((err) => {
				console.dir(err);
				console.error(err.stack);
			})
			.then(() => {
				function prepareResult(item) {
					return new Promise((resolve, reject) => {
						function done(contents) {
							resolve({ [item.name]: contents });
						}

						function textHandler(e) {
							const content = e.target.result;
							done([content]);
						}

						function zipHandler(blob) {
							JSZip.loadAsync(blob)
								.then((zip) => {
									// console.log(zip);

									const re = new RegExp('^ata_output_nr', 'i');

									const promises = R.values(zip.files)
										.filter((file) => {
											console.log(file.name, file);
											return re.test(file.name);
										})
										.map((file) => {
											return file.async('string').then((content) => {
												return content;
											});
										});

									return Promise.all(promises)
										.then((contents) => {
											done(contents);
										});
								})
								.catch((err) => {
									console.error(err.stack || err);
								});
						}

						const blob = item.blob;
						console.log(item.name, blob);

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
							// reader.onload = zipHandler;
							// reader.readAsArrayBuffer(blob);
							zipHandler(blob);
						} else {
							console.warn('unexpected mime type', blob.type);
						}
					});
				}

				const callbacks = {
					// onToolChainStart: () => {
					// 	console.log('onToolChainStart');
					// },
					onToolChainEnd: (taskStatusData) => {
						console.log('done', taskStatusData);
						retrieveAnalysisResults(taskStatusData)
							.then(analysisResults => {
								console.log('analysisResults', analysisResults);
								const promises = R.values(analysisResults)
									.map(prepareResult);

								Promise.all(promises)
									.catch((err) => {
										console.error(err);
									})
									.then((_results) => {
										console.log('results', _results);
										const results = _results
											.reduce((acc, item) => {
												return _.assign(acc, item);
											}, {});
										console.log('analysis results:', results);
										dispatch( setAnalysisResults(results) );
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

				knowledgebaseApi.runToolChain(
					$.ajax,
					modelId,
					toolChainId,
					state.interface.attackerProfile.id,
					callbacks || {}
				)
					.done((data, textStatus, xhr) => {
						monitorTaskStatus(data.task_url, callbacks);
					});
			});

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

		knowledgebaseApi.getToolChains($.ajax, modelId)
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


const loadAttackerProfiles =
module.exports.loadAttackerProfiles =
function loadAttackerProfiles() {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadAttackerProfiles });

		const state = getState();
		const modelId = state.model.metadata.id;

		knowledgebaseApi.getAttackerProfiles($.ajax, modelId)
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

		knowledgebaseApi.getTypes($.ajax, modelId)
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

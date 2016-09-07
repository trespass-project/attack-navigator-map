// const isNodeEnvironment = require('detect-node');
const axios = require('axios');
const R = require('ramda');
const _ = require('lodash');
const JSZip = require('jszip');
const saveAs = require('file-saver').saveAs;
const trespass = require('trespass.js');
const trespassModel = trespass.model;
const api = trespass.api;
const knowledgebaseApi = api.knowledgebase;
const constants = require('./constants.js');
const modelHelpers = require('./model-helpers.js');
const helpers = require('./helpers.js');
const modelPatternLib = require('./pattern-lib.js');


const modelFileName = 'model.xml';
const scenarioFileName = 'scenario.xml';
const scenarioZipName = 'scenario.zip';


const noop = () => {};
const retryRate = 1000;


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
		return knowledgebaseApi.listModels(axios)
			.catch((err) => {
				console.error(err);
			})
			.then((models) => {
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
function initMap(modelId, metadata, anmData={}) {
	// TODO: remove
	if (!modelId) {
		console.error('missing model id');
	}
	if (!metadata) {
		console.error('missing metadata');
	}

	return (dispatch, getState) => {
		return new Promise((resolve, reject) => {
			dispatch( resetMap() );
			dispatch( resetTransformation() );

			dispatch({
				type: constants.ACTION_initMap,
				modelId,
				metadata,
				anmData
			});

			dispatch( fetchKbData(modelId) );
			// dispatch( selectWizardStep('patterns') );

			resolve();
		});
	};
};


const createNewMap =
module.exports.createNewMap =
function createNewMap() {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_createNewMap,
		});

		const title = prompt('Enter map title');
		if (!title || title.trim() === '') {
			// cancelled, or nothing entered
			return;
		}

		const modelId = undefined;
		getModelOrCreate(modelId)
			.then(({ modelId, isNew }) => {
				const metadata = { title };
				return dispatch( initMap(modelId, metadata) )
					.then(() => {
						return dispatch( saveModelToKb(modelId) );
					});
			});
	};
};


const renameMap =
module.exports.renameMap =
function renameMap(modelId, newName) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_updateMetadata,
			metadata: { title: newName },
		});
		// update in kb
		dispatch( saveModelToKb(modelId) );
	};
};


const resetMap =
module.exports.resetMap =
function resetMap() {
	return {
		type: constants.ACTION_resetMap,
	};
};


const fetchKbData =
module.exports.fetchKbData =
function fetchKbData(modelId) {
	return (dispatch, getState) => {
		// load model-specific stuff from knowledgebase
		dispatch( loadComponentTypes(modelId) );
		dispatch( loadAttackerProfiles(modelId) );
		dispatch( loadToolChains(modelId) );
		dispatch( getRecentFiles() );

		// fake api
		// TODO: should use kb
		dispatch( loadModelPatterns(modelId) );
	};
};


// TODO: move to trespass.js
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
		return knowledgebaseApi.createModel(axios, modelId);
	}

	return knowledgebaseApi.getModel(axios, _modelId)
		.then((modelId) => {
			const doesExist = !!modelId;
			if (doesExist) {
				const isNew = false;
				return Promise.resolve({ modelId, isNew });
			} else {
				console.warn(`model does not exist – creating new one with same id: ${_modelId}`);
				return knowledgebaseApi.createModel(axios, _modelId);
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
		return knowledgebaseApi.getModelFile(axios, modelId)
			.then((modelXML) => {
				const source = 'knowledgebase';
				dispatch( loadXML(modelXML, source) );
			})
			.catch((err) => {
				console.error(err.message);
				alert(err.message);
				if (err.response && err.response.status === 404) {
					const message = 'no model file found';
					console.error(message);
					alert(message);
					return;
				}
				console.error(err.stack);
			});
	};
};


const saveModelToKb =
module.exports.saveModelToKb =
function saveModelToKb(modelId) {
	return (dispatch, getState) => {
		if (!modelId) {
			// currently no model open to save
			return Promise.resolve();
		}

		const state = getState();
		const { modelXmlStr } = stateToModelXML(state);
		dispatch({
			type: constants.ACTION_saveModelToKb,
			state,
		});

		return knowledgebaseApi.saveModelFile(axios, modelId, modelXmlStr)
			.then(() => {
				console.info('model sent');
				return dispatch( getRecentFiles() );
			})
			.catch((err) => {
				console.error(err.message);
				alert(err.message);
			});
	};
};


const deleteModel =
module.exports.deleteModel =
function deleteModel(modelId) {
	return (dispatch, getState) => {
		if (!modelId) {
			return;
		}

		if (!confirm('sure?')) {
			return;
		}

		return knowledgebaseApi.deleteModel(axios, modelId)
			.then(() => {
				console.info('model deleted');
				// dispatch({
				// 	type: constants.ACTION_deleteModel,
				// });
				dispatch( resetMap() );
				dispatch( resetTransformation() );
				dispatch( getRecentFiles() );
			})
			.catch((err) => {
				console.error(err.message);
				alert(err.message);
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


function kbCreateNodes(modelId, addedNodes) {
	// update kb
	addedNodes
		.forEach((node) => {
			knowledgebaseApi.createItem(axios, modelId, node);
		});
}


const importFragment =
module.exports.importFragment =
function importFragment(fragment, xy) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_importFragment,
			fragment,
			xy,
			cb: kbCreateNodes
		});
	};
};


const mergeFragment =
module.exports.mergeFragment =
function mergeFragment(fragment) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_mergeFragment,
			fragment,
			cb: kbCreateNodes
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
		// if (!isNodeEnvironment) {
		// 	// TODO: make kb call
		// }

		dispatch({
			type: constants.ACTION_removeNode,
			nodeId,
			cb: (modelId, itemId) => {
				knowledgebaseApi.deleteItem(axios, modelId, itemId);
			}
		});

		const modelId = getState().model.metadata.id;
		dispatch( saveModelToKb(modelId) );
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


const selectWizardStep =
module.exports.selectWizardStep =
function selectWizardStep(name) {
	return {
		type: constants.ACTION_selectWizardStep,
		name
	};
};

// TODO: autoLayout


function readFile(file, cb=noop) {
	const reader = new FileReader();
	reader.onload = (event) => {
		const content = event.target.result;
		cb(content);
	};
	reader.readAsText(file);
}


const loadModelFile =
module.exports.loadModelFile =
function loadModelFile(file) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_loadModelFile,
			file,
		});

		readFile(file, (content) => {
			const source = 'file';
			dispatch( loadXML(content, source) );
		});
	};
};


const mergeModelFile =
module.exports.mergeModelFile =
function mergeModelFile(file) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_mergeModelFile,
			file,
		});

		readFile(file, (xmlString) => {
			// this is a simplified version of `loadXML`

			// TODO: refactor into separate function
			modelHelpers.xmlModelToGraph(xmlString, (err, result) => {
				if (err) {
					console.error(err.stack);
					return;
				}

				const { graph/*, metadata, anmData*/ } = result;
				const fragment = graph;

				const group = modelHelpers.duplicateGroup({
					nodeIds: R.keys(fragment.nodes),
					label: file.name,
				});
				fragment.groups[group.id] = group;

				const { predicates=[] } = result;
				dispatch( addPredicatesToRelationTypes(predicates) );

				R.values(fragment.nodes)
					.forEach(setRandomDefaultPosition);

				// `importFragment()` clones fragment entirely (all new ids)
				dispatch( importFragment(fragment) );

				const modelId = getState().model.metadata.id;
				dispatch( saveModelToKb(modelId) );
			});
		});
	};
};


const setRandomDefaultPosition = (node) => {
	const twoPi = Math.PI * 2;
	const offset = 100;
	const maxRadius = 70;
	node.x = node.x
		|| offset + Math.cos(
			Math.random() * twoPi
		) * maxRadius;
	node.y = node.y
		|| offset + Math.sin(
			Math.random() * twoPi
		) * maxRadius;
};


const loadXML =
module.exports.loadXML =
function loadXML(xmlString, source) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_loadXML,
			xml: xmlString,
			source,
		});

		const sourceIsFile = (source === 'file');

		modelHelpers.xmlModelToGraph(xmlString, (err, result) => {
			if (err) {
				console.error(err.stack);
				return;
			}

			function bla(graph, metadata, anmData) {
				const modelId = metadata.id || undefined;

				return getModelOrCreate(modelId)
					.then(({ modelId, isNew }) => {
						if (!isNew) {
							// model with that id already exists in kb
							const msg = [
								`A model with this id exists already: ${modelId}`,
								'Do you want to overwrite the existing one?'
							].join('\n');

							// only ask, if model was loaded from local file
							const cancelled = (sourceIsFile)
								? !confirm(msg)
								: false;

							if (cancelled) {
								const msg = [
									'Would you still like to load the file, ',
									'but use a new id instead?'
								].join('');
								const cancelled = !confirm(msg);

								if (cancelled) {
									return;
								} else {
									const modelId = helpers.makeId('model');
									const title = `${metadata.title} copy`;
									return bla(
										graph,
										_.merge(
											{},
											metadata,
											{
												id: modelId,
												title,
											}
										),
										anmData
									);
								}
							}
						}

						return dispatch( initMap(modelId, metadata, anmData) )
							.then(() => {
								// import
								// TODO: document
								if (anmData) {
									const fragment = graph;

									// make sure all nodes have at least a default position
									R.values(fragment.nodes)
										.forEach(setRandomDefaultPosition);

									// `mergeFragment()` add everything "as is"
									dispatch( mergeFragment(fragment) );
								} else {
									const fragment = modelHelpers.layoutGraphByType(graph);
									// `importFragment()` clones fragment entirely (all new ids)
									dispatch( importFragment(fragment) );
								}
								return dispatch( saveModelToKb(modelId) );
							});
					});
			}

			const { graph, metadata, anmData } = result;

			const { predicates=[] } = result;
			dispatch( addPredicatesToRelationTypes(predicates) );

			return bla(graph, metadata, anmData);
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


function stateToModelXML(state) {
	const model = modelHelpers.modelFromGraph(
		state.model.graph,
		state.model.metadata,
		state
	);
	const modelXmlStr = trespassModel.toXML(model);
	return { modelXmlStr, model };
}


const downloadModelXML =
module.exports.downloadModelXML =
function downloadModelXML() {
	return (dispatch, getState) => {
		dispatch( humanizeModelIds() )
			.then(() => {
				const { modelXmlStr, model } = stateToModelXML(getState());
				const slugifiedTitle = model.system.title.replace(/\s/g, '-');
				const blob = getXMLBlob(modelXmlStr);
				const fileName = `${slugifiedTitle}.xml`;
				saveAs(blob, fileName);
			});
	};
};


const downloadZippedScenario =
module.exports.downloadZippedScenario =
function downloadZippedScenario(modelId) {
	return (dispatch, getState) => {
		dispatch( humanizeModelIds() )
			.then(() => {
				const state = getState();
				const { modelXmlStr/*, model*/ } = stateToModelXML(state);

				const scenarioXmlStr = generateScenarioXML(
					modelId,
					modelFileName,
					state.interface
				);

				return zipScenario(
					modelXmlStr,
					modelFileName,
					scenarioXmlStr,
					scenarioFileName
				);
			})
			.then((zipBlob) => {
				saveAs(zipBlob, scenarioZipName);
			});
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
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_removeEdge,
			edgeId
		});

		const modelId = getState().model.metadata.id;
		dispatch( saveModelToKb(modelId) );
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
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_removeGroup,
			groupId, removeNodes,
			cb: (modelId, itemId) => {
				knowledgebaseApi.deleteItem(axios, modelId, itemId);
			}
		});

		const modelId = getState().model.metadata.id;
		dispatch( saveModelToKb(modelId) );
	};
};


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(componentId, graphComponentType, newProperties) {
	return {
		type: constants.ACTION_updateComponentProperties,
		componentId,
		graphComponentType,
		newProperties,
		cb: (modelId, item) => {
			knowledgebaseApi.createItem(axios, modelId, item);
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


const deleteAttackerProfile =
module.exports.deleteAttackerProfile =
function deleteAttackerProfile(profileId) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_deleteAttackerProfile,
			profileId,
		});

		const modelId = getState().model.metadata.id;
		knowledgebaseApi.deleteAttackerProfile(axios, modelId, profileId)
			.catch((err) => {
				console.error(err);
			})
			.then(() => {
				dispatch( loadAttackerProfiles(modelId) );
			});
	};
};


const saveAttackerProfile =
module.exports.saveAttackerProfile =
function saveAttackerProfile(profile) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_saveAttackerProfile,
			profile,
		});

		const modelId = getState().model.metadata.id;
		knowledgebaseApi.saveAttackerProfile(axios, modelId, profile)
			.catch((err) => {
				console.error(err);
			})
			.then(() => {
				dispatch( loadAttackerProfiles(modelId) );
			});
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


module.exports.removePolicy =
function removePolicy(policyId) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_removePolicy,
			policyId,
		});

		const modelId = getState().model.metadata.id;
		dispatch( saveModelToKb(modelId) );
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


const addPredicatesToRelationTypes =
module.exports.addPredicatesToRelationTypes =
function addPredicatesToRelationTypes(predicates) {
	return {
		type: constants.ACTION_addPredicatesToRelationTypes,
		predicates,
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
		profit: parseFloat(profit, 10),
	};
};


function monitorTaskStatus(taskUrl, _callbacks={}) {
	const callbacks = _.defaults(_callbacks, {
		onTaskStatus: noop,
	});

	return new Promise((resolve, reject) => {
		let intervalId;

		function check() {
			knowledgebaseApi.getTaskStatus(axios, taskUrl)
				.catch((err) => {
					clearInterval(intervalId);
					console.error(err.stack);
					reject(err);
				})
				.then((taskStatusData) => {
					if (taskStatusData.status) {
						const taskStatusDataCategorized = helpers.handleStatus(taskStatusData);

						// log current tool name
						if (taskStatusDataCategorized.current[0]) {
							console.warn(taskStatusDataCategorized.current[0].name, taskStatusData.status);
						}

						callbacks.onTaskStatus(taskStatusDataCategorized);

						switch (taskStatusData.status) {
							case 'not started':
							case 'running':
								// do nothing
								break;

							case 'error': {
								clearInterval(intervalId);
								const errorMessage = taskStatusDataCategorized.current[0]['error-message'];
								alert(errorMessage);
								console.error(errorMessage);
								break;
							}

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
	const promises = R.keys(analysisResults)
		.reduce((acc, key) => {
			const result = analysisResults[key];
			switch (key) {
				case 'Treemaker':
				case 'Attack Pattern Lib.': {
					const promise = trespass.attacktree.parse(result[0])
						.then((attacktree) => ({ [key]: attacktree }));
					return [...acc, promise];
				}
				case 'A.T. Evaluator': {
					const promise = Promise.resolve(
						{ [key]: trespass.analysis.ate.parse(result[0]) }
					);
					return [...acc, promise];
				}
				case 'A.T. Analyzer': {
					const promises = result
						.map((attacktreeStr) => {
							return trespass.attacktree.parse(attacktreeStr);
						});
					const promise = Promise.all(promises)
						.then((attacktrees) => ({ [key]: attacktrees }));
					return [...acc, promise];
				}
				default: {
					return acc;
				}
			}
		}, []);

	return (dispatch, getState) => {
		Promise.all(promises)
			.then((results) => {
				return results
					.reduce((acc, item) => Object.assign({}, acc, item), {});
			})
			.then((preparedResults) => {
				console.log(preparedResults);
				dispatch({
					type: constants.ACTION_setAnalysisResults,
					analysisResults: preparedResults,
				});
				dispatch(
					resultsSelectTool('Attack Pattern Lib.')
				);
			});
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
	return new Promise((resolve, reject) => {
		const zip = new JSZip();
		zip.file(modelFileName, modelXmlStr);
		zip.file(scenarioFileName, scenarioXmlStr);
		zip.generateAsync({ type: 'blob' })
			.then(resolve)
			.catch((err) => {
				const message = 'zipping failed';
				console.error(message, err.trace);
				reject(new Error(message));
			});
	});
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
	return (dispatch, getState) => {
		// const state = getState();
		// const oldtaskStatusCategorized = state.interface.taskStatusCategorized;
		// if (oldtaskStatusCategorized) {
		// 	const oldCompleted = oldtaskStatusCategorized.completed;
		// 	const { completed } = taskStatusDataCategorized;
		// 	if (oldCompleted.length !== completed.length) {
		// 		// tools that just finished running
		// 		const newCompleted = R.difference(completed, oldCompleted);
		// 	}
		// }

		dispatch({
			type: constants.ACTION_setTaskStatusCategorized,
			taskStatusCategorized: taskStatusDataCategorized
		});
	};
};


const retrieveAnalysisResults =
module.exports.retrieveAnalysisResults =
function retrieveAnalysisResults(taskStatusData) {
	const { analysisToolNames } = trespass.analysis;
	const toolNames = [
		'Treemaker',
		'Attack Pattern Lib.',
		...analysisToolNames,
	];
	return knowledgebaseApi.getAnalysisResults(axios, taskStatusData, toolNames)
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


const humanizeModelIds =
module.exports.humanizeModelIds =
function humanizeModelIds() {
	return (dispatch, getState) => {
		let idReplacementMap;
		dispatch({
			type: constants.ACTION_humanizeModelIds,
			done: (_idReplacementMap) => {
				idReplacementMap = _idReplacementMap;
			}
		});

		// dispatch is synchronous
		dispatch({
			type: constants.ACTION_humanizeModelIds_updateInterfaceState,
			idReplacementMap
		});

		const modelId = getState().model.metadata.id;
		// first save new model to kb,
		// then tell kb, that things have been renamed
		return dispatch( saveModelToKb(modelId) )
			.then(() => {
				// update ids in kb
				const promises = R.toPairs(idReplacementMap)
					.map((pair) => {
						return knowledgebaseApi.renameItemId(
							axios,
							modelId,
							pair[0],
							pair[1]
						)
							.catch(() => {
								console.warn('renaming item id failed');
							});
					});
				return Promise.all(promises);
			});
	};
};


const resetAnalysis =
module.exports.resetAnalysis =
function resetAnalysis() {
	return { type: constants.ACTION_resetAnalysis };
};


const runAnalysis =
module.exports.runAnalysis =
function runAnalysis(modelId, toolChainId, attackerProfileId) {
	if (!modelId) {
		throw new Error('missing model id');
	}

	return (dispatch, getState) => {
		// reset everything before running new analysis
		dispatch( resetAnalysis() );

		const state = getState();
		const toolChains = state.interface.toolChains;
		const toolChainData = toolChains[toolChainId];

		if (!toolChainData) {
			throw new Error('Tool chain not found.');
		}

		// humanize ids
		dispatch( humanizeModelIds() )
			.then(() => {
				const { modelXmlStr, model } = stateToModelXML(state);

				const validationErrors = trespass.model.validateModel(model);
				if (validationErrors.length) {
					alert([
						'Model validation failed:',
						...(validationErrors.map(R.prop('message')))
					].join('\n'));
					return Promise.reject();
				}

				const scenarioXmlStr = generateScenarioXML(
					modelId,
					modelFileName,
					state.interface
				);

				// upload to knowledgebase
				return Promise.resolve()
					.then(() => {
						return knowledgebaseApi.putFile(
							axios,
							modelId,
							modelXmlStr,
							modelFileName,
							'model_file'
						);
					})
					.then(() => {
						return knowledgebaseApi.putFile(
							axios,
							modelId,
							scenarioXmlStr,
							scenarioFileName,
							'scenario_file'
						);
					})
					.catch((err) => {
						console.dir(err);
						console.error(err.stack);
					});
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
											return file.async('string')
												.then((content) => content);
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
						// console.log(item.name, blob);

						const reader = new FileReader();
						// for what we know, zip blob type could be any of these
						const zipTypes = [
							'application/zip',
							'application/x-zip',
							'application/x-zip-compressed',
							'application/octet-stream',
							'multipart/x-zip',
						];
						if (blob.type === 'text/plain'
							|| blob.type === 'application/xml') {
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
								const promises = R.values(analysisResults)
									.map(prepareResult);

								Promise.all(promises)
									.catch((err) => {
										console.error(err);
									})
									.then((_results) => {
										const results = _results
											.reduce((acc, item) => _.assign(acc, item), {});
										dispatch(
											setAnalysisResults(results)
										);
									});
							});
					},
					onTaskStatus: (taskStatusDataCategorized) => {
						dispatch(
							setTaskStatusCategorized(taskStatusDataCategorized)
						);
					},
				};

				knowledgebaseApi.runToolChain(
					axios,
					modelId,
					toolChainId,
					attackerProfileId,
					callbacks || {}
				)
					.then((data) => {
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
function loadToolChains(modelId) {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadToolChains });

		knowledgebaseApi.getToolChains(axios, modelId)
			.catch((err) => {
				console.error(err.stack);
			})
			.then((toolChains) => {
				// TODO: do they all begin with treemaker?
				dispatch({
					type: constants.ACTION_loadToolChains_DONE,
					normalizedToolChains: helpers.normalize(toolChains),
					modelId,
				});
			});
	};
};


const loadAttackerProfiles =
module.exports.loadAttackerProfiles =
function loadAttackerProfiles(modelId) {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadAttackerProfiles });

		knowledgebaseApi.getAttackerProfiles(axios, modelId)
			.then((attackerProfiles) => {
				dispatch({
					type: constants.ACTION_loadAttackerProfiles_DONE,
					normalizedAttackerProfiles: helpers.normalize(attackerProfiles),
					modelId,
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


const loadComponentTypes =
module.exports.loadComponentTypes =
function loadComponentTypes(modelId) {
	return (dispatch, getState) => {
		// dispatch({ type: constants.ACTION_loadComponentTypes });

		knowledgebaseApi.getTypes(axios, modelId)
			.then((types) => {
				// TODO: do preparation elsewhere

				// id → attributes map
				const kbTypeAttributes = types
					.reduce((acc, type) => {
						const id = type['@id'];
						acc[id] = type['tkb:has_attribute']
							.reduce((attributes, attr) => {
								return [
									...attributes,
									{
										id: attr['@id'],
										label: attr['@label'],
										icon: attr['tkb:icon'],
										values: (!attr['tkb:mvalues'])
											? null
											: attr['tkb:mvalues']['@list'],
									}
								];
							}, []);
						return acc;
					}, {});

				const componentsLib = types
					.map((type) => {
						const id = type['@id'];
						const modelComponentType = type['tkb:tml_class'];
						const icon = type['tkb:icon'];

						// we only pick and choose whatever is
						// relevant for the anm
						const _type = {
							id,
							modelComponentType,
							type: id,
							label: type['@label'],
							icon,
							// TODO: rest?
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
					modelComponentTypeToKbTypes,
					modelId,
				});
			})
			.catch(handleError);
	};
};


const showSaveDialog =
module.exports.showSaveDialog =
function showSaveDialog(yesNo) {
	return {
		type: constants.ACTION_showSaveDialog,
		show: yesNo
	};
};


const enableLayer =
/**
 * enables / disables layers
 * @param {String} layerName - name of the layer
 * @param {Boolean} isEnabled - enable or disable
 */
module.exports.enableLayer =
function enableLayer(layerName, isEnabled) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_enableLayer,
			layerName, isEnabled
		});

		const { availableLayersList } = getState().interface;
		const layer = R.find(R.propEq('name', layerName), availableLayersList);
		const cb = (isEnabled)
			? layer.onActivation
			: layer.onDeactivation;
		(cb || noop)(module.exports, dispatch);
	};
};


const nodesStorePosition =
module.exports.nodesStorePosition =
function nodesStorePosition() {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_nodesStorePosition,
		});
	};
};


const nodesRestorePosition =
module.exports.nodesRestorePosition =
function nodesRestorePosition() {
	return (dispatch, getState) => {
		dispatch({ type: constants.ACTION_nodesRestorePosition });
	};
};


const clusterNodesByType =
module.exports.clusterNodesByType =
function clusterNodesByType() {
	return (dispatch, getState) => {
		const { graph } = getState().model;
		const laidOut = modelHelpers.layoutGraphByType(graph);
		// R.values(laidOut.nodes)
		// 	.forEach((node) => {
		// 		//
		// 	});
	};
};


const setHighlighted =
module.exports.setHighlighted =
function setHighlighted(highlightIds) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_setHighlighted,
			highlightIds,
		});
	};
};


const resultsSelectTool =
module.exports.resultsSelectTool =
function resultsSelectTool(toolName) {
	return (dispatch, getState) => {
		dispatch({
			type: constants.ACTION_resultsSelectTool,
			toolName,
		});

		if (toolName === 'Treemaker'
			|| toolName === 'Attack Pattern Lib.') {
			// display tree
			dispatch( resultsSelectAttack(0) );
		}
	};
};


const resultsSelectAttack =
module.exports.resultsSelectAttack =
function resultsSelectAttack(index) {
	return (dispatch, getState) => {
		const state = getState();
		const selectedTool = state.analysis.resultsSelectedTool;
		let attacktree = undefined;

		/* eslint brace-style: 0 */
		if (selectedTool === 'A.T. Analyzer') {
			attacktree = state.analysis.analysisResults[selectedTool][index];
		}
		else if (selectedTool === 'A.T. Evaluator') {
			const aplAttacktree = state.analysis.analysisResults['Attack Pattern Lib.'];
			const rootNode = trespass.attacktree.getRootNode(aplAttacktree);
			const labels = state.analysis.analysisResults[selectedTool][index].labels;
			try {
				attacktree = trespass.attacktree.subtreeFromLeafLabels(
					rootNode,
					labels
				);
			} catch (err) {
				const msg = 'constructing subtree from labels failed';
				console.error(msg);
				attacktree = undefined;
				alert(msg);
			}
		}
		else if (selectedTool === 'Treemaker'
			|| selectedTool === 'Attack Pattern Lib.') {
			attacktree = state.analysis.analysisResults[selectedTool];
		}

		dispatch({
			type: constants.ACTION_resultsSelectAttack,
			index,
			attacktree,
		});
	};
};

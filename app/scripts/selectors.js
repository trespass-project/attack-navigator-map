import { createSelector } from 'reselect';
const R = require('ramda');
const _ = require('lodash');
const constants = require('./constants');
const helpers = require('./helpers');
const modelHelpers = require('./model-helpers');
const trespass = require('trespass.js');


const getNodes = (state) => state.graph.nodes;
const getEdges = (state) => state.graph.edges;
const getPolicies = (state) => state.graph.policies;
const getModelId = (state) => state.metadata.id;
const getRelationTypes = (state) => state.relationTypes;
const getComponentsLib = (state) => state.componentsLib;
const getAttackerProfit = (state) => state.attackerProfit;
const getAttackerProfile = (state) => state.attackerProfile;
const getAttackerProfiles = (state) => state.attackerProfiles;
const getAnalysisResults = (state) => state.analysisResults;
const getResultsAttacktree = (state) => state.resultsAttacktree;
const getActiveLayersList = (state) => state.activeLayersList;
const getAvailableLayersList = (state) => state.availableLayersList;


// const nodesList =
module.exports.nodesList = createSelector(
	getNodes,
	R.values
);


// const attackerProfit =
module.exports.attackerProfit = createSelector(
	getAttackerProfit,
	(profit) => parseFloat(profit, 10)
);


// const resultsAttacktreeIdHistogram =
module.exports.resultsAttacktreeIdHistogram = createSelector(
	getResultsAttacktree,
	(attacktree) => {
		const { histogram } = (!!attacktree)
			? helpers.getAllIdsFromTree(
				trespass.attacktree.getRootNode(attacktree)
			)
			: {};
		return histogram;
	}
);

// const componentsLibMap =
module.exports.componentsLibMap = createSelector(
	getComponentsLib,
	R.partial(helpers.toHashMap, ['type'])
);

// const relationsMap =
module.exports.relationsMap = createSelector(
	getRelationTypes,
	R.partial(helpers.toHashMap, ['value'])
);

// const hasOpenMap =
module.exports.hasOpenMap = createSelector(
	getModelId,
	(modelId) => !!modelId
);

// const splitEdges =
module.exports.splitEdges = createSelector(
	getEdges,
	(edgesMap) => {
		const edges = R.values(edgesMap) || [];
		return edges
			.reduce((acc, edge) => {
				if (modelHelpers.relationConvertsToEdge(edge.relation)) {
					acc.regularEdges = [...acc.regularEdges, edge];
				} else {
					acc.predicateEdges = [...acc.predicateEdges, edge];
				}
				return acc;
			}, {
				regularEdges: [],
				predicateEdges: [],
			});
	}
);

// const getNodeWarnings =
module.exports.getNodeWarnings = createSelector(
	getNodes,
	getEdges,
	(nodes, edges) => {
		/* eslint no-param-reassign: 0 */

		const applyAll = (predicateFuncs, it) => predicateFuncs
			.map((func) => func(it));

		return R.values(nodes)
			.reduce((acc, node) => {
				let messages = [];
				const nodeEdges = modelHelpers.getNodeEdges(node, edges);

				// missing actor type
				if (node.modelComponentType === 'actor'
					&& !node['tkb:actor_type']) {
					messages = [...messages, 'is missing actor type'];
				}

				// data items need a value
				if (node.modelComponentType === 'data'
					&& _.isEmpty(node.value)) {
					messages = [...messages, 'needs a value'];
				}

				// location is not connected to anything
				if (node.modelComponentType === 'location') {
					const connectionEdges = nodeEdges
						.filter((edge) => (edge.relation === constants.RELTYPE_PHYSICAL_CONNECTION));
					if (!connectionEdges.length) {
						messages = [...messages, 'is not connected to anything'];
					}
				}

				// things are not located anywhere
				if (R.contains(node.modelComponentType, ['actor', 'item', 'data'])) {
					const atLocationEdges = nodeEdges
						.filter(R.propEq('from', node.id))
						.filter(R.propEq('relation', constants.RELTYPE_ATLOCATION));
					if (!atLocationEdges.length) {
						messages = [...messages, 'is not located anywhere'];
					}
				}

				if (!!messages.length) {
					acc[node.id] = {
						id: node.id,
						messages,
					};
				}

				return acc;
			}, {});
	}
);


// const selectedAttackerProfileId =
module.exports.selectedAttackerProfileId = createSelector(
	getAttackerProfile,
	getAttackerProfiles,
	(attackerProfile={}, profilePresets=[]) => {
		// see if there is a preset that matches the current configuration
		const matchingPreset = R.find(
			(preset) => helpers.areAttackerProfilesEqual(attackerProfile, preset),
			R.values(profilePresets)
		);

		return (!matchingPreset)
			? undefined // ''
			: matchingPreset.id;
	}
);


// const attackerProfileIsComplete =
module.exports.attackerProfileIsComplete = createSelector(
	getAttackerProfile,
	(attackerProfile) => {
		return (!attackerProfile)
			? false
			: (
				!_.isEmpty(attackerProfile.budget) &&
				!_.isEmpty(attackerProfile.time) &&
				!_.isEmpty(attackerProfile.skill)
			);
	}
);


// const locationOptions =
module.exports.locationOptions = createSelector(
	getNodes,
	(nodesMap) => {
		const locationCollectionNames = [
			'actor',
			'location',
			'item',
			'data',
		];
		const typeFilter = R.pipe(
			R.prop('modelComponentType'),
			R.contains(R.__, locationCollectionNames)
		);
		const options = R.values(nodesMap)
			.filter(typeFilter)
			.map((node) => {
				return {
					value: node.id,
					label: node.label,
				};
			});
		return options;
	}
);


// const nodesWithPolicies =
module.exports.nodesWithPolicies = createSelector(
	getPolicies,
	(policiesMap) => {
		return R.values(policiesMap || {})
			.reduce((acc, policy) => {
				(policy.atLocations || []).forEach((locationId) => {
					acc[locationId] = true;
				});
				return acc;
			}, {});
	}
);


const notEmpty = R.complement(_.isEmpty);

// const displayLayersList =
module.exports.displayLayersList = createSelector(
	getAvailableLayersList,
	getAnalysisResults,
	(layers, analysisResults) => {
		return layers
			.filter((item) => notEmpty(item.displayName))
			.filter((item) => {
				// only show heatmap layer option when there
				// actually are analysis results
				if (item.name === 'HeatmapLayer'
					&& R.isNil(analysisResults)) {
					return false;
				}
				return true;
			});
	}
);

// const activeLayers =
module.exports.activeLayers = createSelector(
	getActiveLayersList,
	R.partial(helpers.toHashMap, ['name'])
);


function componentTypesFilter(types) {
	return (item) => R.contains(item.modelComponentType, types);
}

// const componentsLibFiltered =
module.exports.componentsLibCategorized = createSelector(
	getComponentsLib,
	(componentsLib) => {
		return {
			'locations': componentsLib
				.filter(componentTypesFilter(['location'])),
			'assets': componentsLib
				.filter(componentTypesFilter(['item', 'data'])),
			'actors': componentsLib
				.filter(componentTypesFilter(['actor'])),
		};
	}
);

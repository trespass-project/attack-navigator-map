const R = require('ramda');
const _ = require('lodash');
import { createSelector } from 'reselect';
const React = require('react');
const reactDOM = require('react-dom');
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import ReduxThunk from 'redux-thunk';

const modelReducer = require('./modelReducer.js');
const interfaceReducer = require('./interfaceReducer.js');
const analysisReducer = require('./analysisReducer.js');

const HTML5Backend = require('react-dnd-html5-backend');
const DragDropContext = require('react-dnd').DragDropContext;

const helpers = require('./helpers');
const modelHelpers = require('./model-helpers');
const trespass = require('trespass.js');


function configureStore(initialState) {
	const combinedReducers = combineReducers({
		model: modelReducer.reducer,
		interface: interfaceReducer.reducer,
		analysis: analysisReducer.reducer,
	});

	const store = createStore(
		combinedReducers,
		initialState,
		applyMiddleware(ReduxThunk)
	);

	return store;
}
const store = configureStore();


// selectors
const getNodes = (state) => state.graph.nodes;
const getEdges = (state) => state.graph.edges;
const getModelId = (state) => state.metadata.id;
const getRelationTypes = (state) => state.relationTypes;
const getComponentsLib = (state) => state.componentsLib;
const getAttackerProfile = (state) => state.attackerProfile;
const getAttackerProfiles = (state) => state.attackerProfiles;
const getResultsAttacktree = (state) => state.resultsAttacktree;

const resultsAttacktreeIdHistogram = createSelector(
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

const componentsLibMap = createSelector(
	getComponentsLib,
	(components) => helpers.toHashMap('type', components)
);

const relationsMap = createSelector(
	getRelationTypes,
	(relationTypes) => helpers.toHashMap('value', relationTypes)
);

const hasOpenMap = createSelector(
	getModelId,
	(modelId) => !!modelId
);

const splitEdges = createSelector(
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

const getNodeWarnings = createSelector(
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
						.filter((edge) => ((!edge.relation) || (edge.relation === 'connects')));
					if (!connectionEdges.length) {
						messages = [...messages, 'is not connected to anything'];
					}
				}

				// things are not located anywhere
				if (R.contains(node.modelComponentType, ['actor', 'item', 'data'])) {
					const atLocationEdges = nodeEdges
						.filter((edge) => (edge.from === node.id))
						.filter((edge) => (edge.relation === 'at-location'));
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


const selectedAttackerProfileId = createSelector(
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


const attackerProfileIsComplete = createSelector(
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


function mapStateToProps(_state) {
	// flatten one level
	const state = Object.assign.apply(
		null,
		[{}, ...R.values(_state)]
	);

	// layers get the chance to change props
	const props = R.values(state.activeLayers)
		.reduce(
			(acc, layer) => (layer.adjustProps || R.identity)(acc),
			state
		);

	const { regularEdges, predicateEdges } = splitEdges(state);
	props.regularEdges = regularEdges;
	props.predicateEdges = predicateEdges;

	props.hasOpenMap = hasOpenMap(state);
	props.relationsMap = relationsMap(state);
	props.componentsLibMap = componentsLibMap(state);

	// attacker profile
	props.selectedAttackerProfileId = selectedAttackerProfileId(state);
	props.attackerProfileIsComplete = attackerProfileIsComplete(state);

	props.resultsAttacktreeIdHistogram = resultsAttacktreeIdHistogram(state);

	// validation
	props.validation = {
		componentWarnings: getNodeWarnings(props),
	};

	return props;
}

let App = require('./App.js');
App = DragDropContext(HTML5Backend)(App); // eslint-disable-line new-cap
App = connect(mapStateToProps)(App);

reactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#app')
);

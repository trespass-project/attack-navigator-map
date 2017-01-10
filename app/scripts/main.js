const R = require('ramda');
const React = require('react');
const reactDOM = require('react-dom');
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import createLogger from 'redux-logger';
import undoable, { includeAction } from 'redux-undo';

const modelReducer = require('./modelReducer.js');
const interfaceReducer = require('./interfaceReducer.js');
const analysisReducer = require('./analysisReducer.js');

const selectors = require('./selectors.js');
const constants = require('./constants.js');

const HTML5Backend = require('react-dnd-html5-backend');
const DragDropContext = require('react-dnd').DragDropContext;


const blacklist = [
	'ACTION_setEditorElem',
	'ACTION_setMouseOverEditor',
	'ACTION_hideContextMenu',
	'ACTION_select',
	'ACTION_setPanning',
	'ACTION_setDrag',
	'ACTION_setDragNode',
	'ACTION_selectWizardStep',
	'ACTION_setAttackerProfit',
	'ACTION_moveNode',
	'ACTION_moveGroup',
	'ACTION_setHoverNode',
	'ACTION_setHoverGroup',
	'ACTION_setPreviewEdge',
	'ACTION_setTransformation',
	// 'ACTION_setTaskStatusCategorized',
	'ACTION_updateComponentProperties',
	'ACTION_setHighlighted',
	'ACTION_saveModelToKb',
];
const logger = createLogger({
	timestamp: false,
	collapsed: true,
	predicate: (getState, action) => {
		return !R.contains(action.type, blacklist);
	}
});


function configureStore(initialState) {
	const combinedReducers = combineReducers({
		model: modelReducer.reducer,
		interface: interfaceReducer.reducer,
		analysis: analysisReducer.reducer,
	});

	const store = createStore(
		undoable(
			combinedReducers,
			{
				limit: 10,
				filter: includeAction([
					// groups
					constants.ACTION_addGroup,
					constants.ACTION_cloneGroup,
					constants.ACTION_removeGroupBackgroundImage,
					constants.ACTION_addGroupBackgroundImage,

					// nodes
					constants.ACTION_cloneNode,
					constants.ACTION_removeNode,
					constants.ACTION_addNodeToGroup,
					constants.ACTION_ungroupNode,

					// edges
					constants.ACTION_addEdge,
					constants.ACTION_removeEdge,
					constants.ACTION_predicateChanged,

					constants.ACTION_importFragment,
					constants.ACTION_mergeFragment,

					constants.ACTION_addProcess,
					constants.ACTION_addPolicy,
					constants.ACTION_removePolicy,
				]),
			}
		),
		initialState,
		applyMiddleware(ReduxThunk, logger)
	);

	return store;
}
const store = configureStore();


function mapStateToProps(_state) {
	// flatten one level
	const state = Object.assign.apply(
		null,
		[{}, ...R.values(_state.present)]
	);

	// layers get the chance to change props
	const props = state.activeLayersList
		.reduce(
			(acc, layer) => (layer.adjustProps || R.identity)(acc),
			state
		);

	const { regularEdges, predicateEdges } = selectors.splitEdges(state);
	props.regularEdges = regularEdges;
	props.predicateEdges = predicateEdges;

	props.hasOpenMap = selectors.hasOpenMap(state);
	props.relationsMap = selectors.relationsMap(state);
	props.componentsLibMap = selectors.componentsLibMap(state);

	// attacker profile
	props.attackerProfit = selectors.attackerProfit(state);
	props.selectedAttackerProfileId = selectors.selectedAttackerProfileId(state);
	props.attackerProfileIsComplete = selectors.attackerProfileIsComplete(state);

	props.resultsAttacktreeLabelsHistogram = selectors.resultsAttacktreeLabelsHistogram(props);
	props.labelToNodeIdsMap = selectors.labelToNodeIdsMap(props);
	props.resultsAttacktreeIdHistogram = selectors.resultsAttacktreeIdHistogram(state);

	props.locationOptions = selectors.locationOptions(state);
	props.nodesWithPolicies = selectors.nodesWithPolicies(state);

	props.activeLayers = selectors.activeLayers(props);
	props.displayLayersList = selectors.displayLayersList(props);

	props.componentsLibCategorized = selectors.componentsLibCategorized(state);

	// validation
	props.validation = {
		componentWarnings: selectors.getNodeWarnings(props),
	};

	props.nodesList = selectors.nodesList(state);
	props.predicatesList = selectors.predicatesList(state);
	props.processesList = selectors.processesList(state);
	props.policiesList = selectors.policiesList(state);

	props.groupedNodeIds = selectors.groupedNodeIds(props);

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

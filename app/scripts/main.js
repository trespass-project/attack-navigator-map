const R = require('ramda');
const React = require('react');
const reactDOM = require('react-dom');
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import ReduxThunk from 'redux-thunk';

const modelReducer = require('./modelReducer.js');
const interfaceReducer = require('./interfaceReducer.js');
const analysisReducer = require('./analysisReducer.js');

const selectors = require('./selectors.js');

const HTML5Backend = require('react-dnd-html5-backend');
const DragDropContext = require('react-dnd').DragDropContext;


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

	const { regularEdges, predicateEdges } = selectors.splitEdges(state);
	props.regularEdges = regularEdges;
	props.predicateEdges = predicateEdges;

	props.hasOpenMap = selectors.hasOpenMap(state);
	props.relationsMap = selectors.relationsMap(state);
	props.componentsLibMap = selectors.componentsLibMap(state);

	// attacker profile
	props.selectedAttackerProfileId = selectors.selectedAttackerProfileId(state);
	props.attackerProfileIsComplete = selectors.attackerProfileIsComplete(state);

	props.resultsAttacktreeIdHistogram = selectors.resultsAttacktreeIdHistogram(state);

	props.locationOptions = selectors.locationOptions(state);

	// validation
	props.validation = {
		componentWarnings: selectors.getNodeWarnings(props),
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

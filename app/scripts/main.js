const R = require('ramda');
import { createSelector } from 'reselect';
const React = require('react');
const reactDOM = require('react-dom');
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import ReduxThunk from 'redux-thunk';

const modelReducer = require('./modelReducer.js');
const interfaceReducer = require('./interfaceReducer.js');

const HTML5Backend = require('react-dnd-html5-backend');
const DragDropContext = require('react-dnd').DragDropContext;


function configureStore(initialState) {
	const combinedReducers = combineReducers({
		model: modelReducer.reducer,
		interface: interfaceReducer.reducer,
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

	// validation
	const getNodes = (state) => state.graph.nodes;
	const getNodeWarnings = createSelector(
		getNodes,
		(nodes) => {
			/* eslint no-param-reassign: 0 */
			return R.values(nodes)
				.filter(R.propEq('modelComponentType', 'actor'))
				.filter((item) => !item['tkb:actor_type'])
				.reduce((acc, item) => {
					const message = 'is missing actor type';
					acc[item.id] = { id: item.id, message, };
					return acc;
				}, {});
		}
	);
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

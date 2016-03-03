'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const _ = require('lodash');

const createStore = require('redux').createStore;
const combineReducers = require('redux').combineReducers;
const applyMiddleware = require('redux').applyMiddleware;
const connect = require('react-redux').connect;
const Provider = require('react-redux').Provider;
const thunk = require('redux-thunk');

// const ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
// const MainMenu = require('./MainMenu.js');
const Wizard = require('./Wizard.js');

const GraphEditor = require('./GraphEditor.js');
const actionCreators = require('./actionCreators.js');

const HTML5Backend = require('react-dnd-html5-backend');
const DragDropContext = require('react-dnd').DragDropContext;


let App = React.createClass({
	componentDidMount: function() {
		const props = this.props;

		const editorElem = document.querySelector('#editor > svg');
		props.dispatch( actionCreators.setEditorElem(editorElem) );

		props.dispatch( actionCreators.loadAttackerProfiles() );
		props.dispatch( actionCreators.loadToolChains() );
	},

	render: function() {
		const props = this.props;
		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				<div id='map-container'>
					<div id='map'>
						<GraphEditor id='editor' {...props} />
					</div>
				</div>

				{/*<div id='model-debug-view'>
					<div className='panel-section'>
						<h3 className='title'>debug</h3>
						<MainMenu id='main-menu' {...props} />
					</div>
					<div className='panel-section'>
						<h3 className='title'>model</h3>
						<ModelDebugView {...props} />
					</div>
				</div>*/}

				<div id='panel-container'>
					<Wizard {...props} />
				</div>
			</div>
		);
	}
});


const reducer = combineReducers({
	model: require('./modelReducer.js'),
	interface: require('./interfaceReducer.js'),
});
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducer);

function mapStateToProps(state) {
	const newState = _.merge({}, state.model, state.interface);
	return newState;
}

App = DragDropContext(HTML5Backend)(App);
App = connect(mapStateToProps)(App);

reactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#app')
);

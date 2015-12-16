'use strict';

let React = require('react');
let _ = require('lodash');

let createStore = require('redux').createStore;
let combineReducers = require('redux').combineReducers;
let applyMiddleware = require('redux').applyMiddleware;
let connect = require('react-redux').connect;
let Provider = require('react-redux').Provider;
let thunk = require('redux-thunk');

let ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
let GraphOutline = require('./GraphOutline.js');
let MainMenu = require('./MainMenu.js');
let Wizard = require('./Wizard.js');

let GraphEditor = require('./GraphEditor.js');
let actionCreators = require('./actionCreators.js');

let HTML5Backend = require('react-dnd/modules/backends/HTML5');
let DragDropContext = require('react-dnd').DragDropContext;


let App = React.createClass({
	componentDidMount: function() {
		const editorElem = document.querySelector('#editor > svg');
		this.props.dispatch( actionCreators.setEditorElem(editorElem) );
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

				<div id='model-debug-view'>
					<div className='panel-section'>
						<h3 className='title'>debug</h3>
						<MainMenu id='main-menu' {...props} />
					</div>
					<div className='panel-section'>
						<h3 className='title'>outline</h3>
							<GraphOutline graph={props.graph} dispatch={props.dispatch} />
					</div>
					<div className='panel-section'>
						<h3 className='title'>model</h3>
						<ModelDebugView {...props} />
					</div>
				</div>

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
let store = createStoreWithMiddleware(reducer);

function mapStateToProps(state) {
	const newState = _.merge({}, state.model, state.interface);
	return newState;
}

App = DragDropContext(HTML5Backend)(App);
App = connect(mapStateToProps)(App);

React.render(
	<Provider store={store}>
		{ function() { return <App />; } }
	</Provider>,
	document.querySelector('#app')
);

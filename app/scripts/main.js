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
	childContextTypes: {
		dispatch: React.PropTypes.func,
	},

	getChildContext: function() {
		return {
			dispatch: this.props.dispatch,
		};
	},

	componentDidMount: function() {
		const props = this.props;

		props.dispatch( actionCreators.initMap() );

		const editorElem = document.querySelector('#editor > svg');
		props.dispatch( actionCreators.setEditorElem(editorElem) );

		// kb api
		props.dispatch( actionCreators.loadComponentTypes() );
		props.dispatch( actionCreators.loadAttackerProfiles() );
		props.dispatch( actionCreators.loadModelPatterns() );
		props.dispatch( actionCreators.loadRelationTypes() );

		// tools api
		props.dispatch( actionCreators.loadToolChains() );

		window.addEventListener('beforeunload', this.handleBeforeUnload);
	},

	componentWillUnmount: function() {
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
	},

	handleBeforeUnload: function(event) {
		event.preventDefault();

		// TODO: check if model is empty
		// if so, delete from knowledgebase

		const msg = 'Are you sure? — All changes will be lost ...';
		event.returnValue = msg;
		return msg;
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
	return _.assign({}, state.model, state.interface);
}

App = DragDropContext(HTML5Backend)(App);
App = connect(mapStateToProps)(App);

reactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#app')
);

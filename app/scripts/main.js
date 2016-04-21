'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const _ = require('lodash');
const R = require('ramda');
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
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	getChildContext: function() {
		const props = this.props;
		return {
			theme: props.theme,
			dispatch: props.dispatch,
		};
	},

	componentDidMount: function() {
		const props = this.props;

		props.dispatch(
			actionCreators.initMap(undefined, () => {
				// kb api
				props.dispatch( actionCreators.loadComponentTypes() );
				props.dispatch( actionCreators.loadAttackerProfiles() );
				props.dispatch( actionCreators.loadToolChains() );
			})
		);

		// fake api
		props.dispatch( actionCreators.loadModelPatterns() );
		props.dispatch( actionCreators.loadRelationTypes() );

		// tools api
		// props.dispatch( actionCreators.loadToolChains() );

		const editorElem = document.querySelector('#editor > svg');
		props.dispatch( actionCreators.setEditorElem(editorElem) );

		window.addEventListener('beforeunload', this.handleBeforeUnload);
	},

	componentWillUnmount: function() {
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
	},

	handleBeforeUnload: function(event) {
		event.preventDefault();

		// TODO: check if model is empty
		// if so, delete from knowledgebase

		const msg = 'Are you sure?';
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
	// flatten one level
	return _.assign.apply(
		null,
		[{}].concat(R.values(state))
	);
}

App = DragDropContext(HTML5Backend)(App);
App = connect(mapStateToProps)(App);

reactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#app')
);

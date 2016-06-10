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

const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

const modelReducer = require('./modelReducer.js');
const interfaceReducer = require('./interfaceReducer.js');

const knowledgebaseApi = require('trespass.js').api.knowledgebase;

// const ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
// const MainMenu = require('./MainMenu.js');
const Wizard = require('./Wizard.js');
const UsageHint = require('./UsageHint.js');

const GraphEditor = require('./GraphEditor.js');
const actionCreators = require('./actionCreators.js');

const HTML5Backend = require('react-dnd-html5-backend');
const DragDropContext = require('react-dnd').DragDropContext;


let App = React.createClass({
	childContextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	getChildContext() {
		const props = this.props;
		return {
			theme: props.theme,
			dispatch: props.dispatch,
		};
	},

	componentDidMount() {
		const props = this.props;

		props.dispatch( actionCreators.resetTransformation() );
		props.dispatch( actionCreators.getRecentFiles() );

		const editorElem = document.querySelector('#editor > svg');
		props.dispatch( actionCreators.setEditorElem(editorElem) );

		window.addEventListener('beforeunload', this.handleBeforeUnload);
	},

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
	},

	handleBeforeUnload(event) {
		event.preventDefault();

		// TODO: check if model is empty
		// if so, delete from knowledgebase

		const msg = 'Are you sure?';
		event.returnValue = msg;
		return msg;
	},

	render() {
		const props = this.props;
		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				<div id='meta'>
					{(props.metadata.id)
						? <div>
							<div>model id: {props.metadata.id}</div>
							<div>title: {props.metadata.title}</div>
						</div>
						: <UsageHint>no model — create new one, or import model file</UsageHint>
					}

					{(props.metadata.id)
						? <div>
							<a
								href={`${knowledgebaseApi.host}tkb/files/edit?model_id=${props.metadata.id}`}
								target='_blank'
							>
								edit knowledgebase files
							</a>
						</div>
						: ''
					}

					<div>———</div>
					ANM {pkg.version}<br />

					<UsageHint>
						<a
							href='https://gitlab.com/freder/anm-feedback/issues'
							target='_blank'
						>
							report bug / give feedback
						</a>
					</UsageHint>
				</div>

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
	model: modelReducer,
	interface: interfaceReducer,
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

App = DragDropContext(HTML5Backend)(App); // eslint-disable-line new-cap
App = connect(mapStateToProps)(App);

reactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#app')
);

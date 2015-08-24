'use strict';

var $ = require('jquery');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var flummox = require('flummox');
var Flux = flummox.Flux;
var FluxComponent = require('flummox/component');

const constants = require('./constants.js');

var LibraryActions = require('./components/Library/LibraryActions.js');
var LibraryStore = require('./components/Library/LibraryStore.js');
var Library = require('./components/Library/Library.js');
var ModelLibrary = require('./components/ModelLibrary/ModelLibrary.js');
var ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
var GraphOutline = require('./GraphOutline.js');

var HTMLOverlay = require('./HTMLOverlay.js');
var MainMenu = require('./MainMenu.js');
var PropertiesPanel = require('./PropertiesPanel.js');
var Graph = require('./Graph.js').Graph;
var GraphEditor = require('./Graph.js').GraphEditor;
var GraphMinimap = require('./Graph.js').GraphMinimap;
var GraphActions = require('./GraphActions.js');
var GraphStore = require('./GraphStore.js');
var InterfaceActions = require('./InterfaceActions.js');
var InterfaceStore = require('./InterfaceStore.js');


function handleAdd() {
	console.log('here');
}


class MapFlux extends Flux {
	constructor() {
		super();

		this.createActions(constants.GRAPH, GraphActions);
		this.createStore(constants.GRAPH, GraphStore, this);

		this.createActions(constants.INTERFACE, InterfaceActions);
		this.createStore(constants.INTERFACE, InterfaceStore, this);

		this.createActions(constants.MODEL_COMPONENTS_LIBRARY, LibraryActions);
		this.createStore(constants.MODEL_COMPONENTS_LIBRARY, LibraryStore, this, constants.MODEL_COMPONENTS_LIBRARY);

		this.createActions(constants.MODEL_PATTERNS_LIBRARY, LibraryActions);
		this.createStore(constants.MODEL_PATTERNS_LIBRARY, LibraryStore, this, constants.MODEL_PATTERNS_LIBRARY);

		// this.createActions(constants.MODEL_LIBRARY, LibraryActions);
		// this.createStore(constants.MODEL_LIBRARY, LibraryStore, this, constants.MODEL_LIBRARY);
	}
}

const flux = new MapFlux();

var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var App = React.createClass({
	// mixins: [PureRenderMixin],

	childContextTypes: {
		graphActions: React.PropTypes.object.isRequired,
		interfaceActions: React.PropTypes.object.isRequired
	},

	getChildContext: function() {
		return {
			graphActions: flux.getActions(constants.GRAPH),
			interfaceActions: flux.getActions(constants.INTERFACE),
		};
	},

	render: function() {
		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				<div id='map-container'>
					<div id='map'>
						<FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
							<GraphEditor id='editor' />
						</FluxComponent>
					</div>
				</div>
				<div id='model-debug-view'>
					<div className='panel-section'>
						<h3 className='title'>debug</h3>
						<FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
							<MainMenu id='main-menu' />
						</FluxComponent>
					</div>
					<div className='panel-section'>
						<h3 className='title'>outline</h3>
						<FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
							<GraphOutline />
						</FluxComponent>
					</div>
					<div className='panel-section'>
						<h3 className='title'>model</h3>
						<FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
							<ModelDebugView />
						</FluxComponent>
					</div>
				</div>
				<div id='panel-container'>
					<FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
						<GraphMinimap id='minimap' />
					</FluxComponent>
					<FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
						<PropertiesPanel id='propspanel' />
					</FluxComponent>

					{/*<div id='model-library'>
						<FluxComponent flux={flux} connectToStores={[constants.MODEL_LIBRARY]} libName={constants.MODEL_LIBRARY}>
							<ModelLibrary url='data/models.json' title='models' />
						</FluxComponent>
					</div>*/}

					<div id='pattern-lib'>
						<FluxComponent flux={flux} connectToStores={[constants.MODEL_PATTERNS_LIBRARY]} libName={constants.MODEL_PATTERNS_LIBRARY}>
							<Library url={'data/'+constants.MODEL_PATTERNS_LIBRARY} title='patterns' />
						</FluxComponent>
					</div>

					<div id='component-lib'>
						<FluxComponent flux={flux} connectToStores={[constants.MODEL_COMPONENTS_LIBRARY]} libName={constants.MODEL_COMPONENTS_LIBRARY}>
							<Library url={'data/'+constants.MODEL_COMPONENTS_LIBRARY} title='components' onAdd={handleAdd} />
						</FluxComponent>
					</div>
				</div>
			</div>
		);
	}
});

App = DragDropContext(HTML5Backend)(App);


React.render(
	<App />,
	$('#app')[0]
);

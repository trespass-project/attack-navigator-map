'use strict';

var $ = require('jquery');
var React = require('react');
var flummox = require('flummox');
var Flux = flummox.Flux;
var FluxComponent = require('flummox/component');

const constants = require('./constants.js');
const C = constants;

var LibraryActions = require('./components/Library/LibraryActions.js');
var LibraryStore = require('./components/Library/LibraryStore.js');
var Library = require('./components/Library/Library.js');
var ModelLibrary = require('./components/ModelLibrary/ModelLibrary.js');
var ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');

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

		this.createActions('graph', GraphActions);
		this.createStore('graph', GraphStore, this);

		this.createActions('interface', InterfaceActions);
		this.createStore('interface', InterfaceStore, this);

		this.createActions(C.MODEL_COMPONENTS_LIBRARY, LibraryActions);
		this.createStore(C.MODEL_COMPONENTS_LIBRARY, LibraryStore, this, C.MODEL_COMPONENTS_LIBRARY);

		this.createActions(C.MODEL_PATTERNS_LIBRARY, LibraryActions);
		this.createStore(C.MODEL_PATTERNS_LIBRARY, LibraryStore, this, C.MODEL_PATTERNS_LIBRARY);

		// this.createActions(C.MODEL_LIBRARY, LibraryActions);
		// this.createStore(C.MODEL_LIBRARY, LibraryStore, this, C.MODEL_LIBRARY);
	}
}

const flux = new MapFlux();

var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var App = React.createClass({
	render: function() {
		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				<div id='map-container'>
					<div id='map'>
						<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
							<GraphEditor id='editor' />
						</FluxComponent>
					</div>
				</div>
				<div id='model-debug-view'>
					<h3>debug</h3>
					<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
						<MainMenu id='main-menu' />
					</FluxComponent>
					<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
						<ModelDebugView />
					</FluxComponent>
				</div>
				<div id='panel-container'>
					<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
						<GraphMinimap id='minimap' />
					</FluxComponent>
					<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
						<PropertiesPanel id='propspanel' />
					</FluxComponent>

					{/*<div id='model-library'>
						<FluxComponent flux={flux} connectToStores={[C.MODEL_LIBRARY]} libName={C.MODEL_LIBRARY}>
							<ModelLibrary url='data/models.json' title='models' />
						</FluxComponent>
					</div>*/}

					<div id='pattern-lib'>
						<FluxComponent flux={flux} connectToStores={[C.MODEL_PATTERNS_LIBRARY]} libName={C.MODEL_PATTERNS_LIBRARY}>
							<Library url='data/pattern-lib.json' title='patterns' />
						</FluxComponent>
					</div>

					<div id='component-lib'>
						<FluxComponent flux={flux} connectToStores={[C.MODEL_COMPONENTS_LIBRARY]} libName={C.MODEL_COMPONENTS_LIBRARY}>
							<Library url='data/component-lib.json' title='components' onAdd={handleAdd} />
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

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

		this.createActions(C.LOCATION_LIBRARY, LibraryActions);
		this.createStore(C.LOCATION_LIBRARY, LibraryStore, this, C.LOCATION_LIBRARY);

		this.createActions(C.MODEL_LIBRARY, LibraryActions);
		this.createStore(C.MODEL_LIBRARY, LibraryStore, this, C.MODEL_LIBRARY);
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
					<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
						<ModelDebugView />
					</FluxComponent>
				</div>
				<div id='panel-container'>
					<div id='model-library'>
						<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
							<GraphMinimap id='minimap' constantScale={0.2} />
						</FluxComponent>
						<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
							<PropertiesPanel id='propspanel' />
						</FluxComponent>
						<FluxComponent flux={flux} connectToStores={['graph', 'interface']}>
							<MainMenu id='main-menu' />
						</FluxComponent>
						<FluxComponent flux={flux} connectToStores={[C.MODEL_LIBRARY]} libName={C.MODEL_LIBRARY}>
							<ModelLibrary url='data/models.json' title='models' />
						</FluxComponent>
					</div>
					<div id='location-library'>
						<FluxComponent flux={flux} connectToStores={[C.LOCATION_LIBRARY]} libName={C.LOCATION_LIBRARY}>
							<Library url='data/locations.json' title='locations' onAdd={handleAdd} />
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

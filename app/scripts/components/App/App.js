// var $ = require('jquery');
// var _ = require('lodash');
var React = require('react');
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragDropContext = require('react-dnd').DragDropContext;

var constants = require('../../constants.js');

var FluxComponent = require('flummox/component');
var Library = require('../Library/Library.js');
var ModelLibrary = require('../ModelLibrary/ModelLibrary.js');
var ModelDebugView = require('../ModelDebugView/ModelDebugView.js');


function handleAdd() {
	console.log('here');
}


class App extends React.Component {
	render() {
		var flux = this.props.flux;

		// http://gaearon.github.io/react-dnd/docs-troubleshooting.html#could-not-find-the-drag-and-drop-manager-in-the-context
		// https://github.com/gaearon/react-dnd/issues/185#issuecomment-110048466
		return (
			<div id="viewport">
				<div id="map-container">
					<div id="model-debug-view">
						<FluxComponent flux={flux} connectToStores={[constants.APP]} libName={constants.APP}>
							<ModelDebugView />
						</FluxComponent>
					</div>
				</div>
				<div id="panel-container">
					<div id="model-library">
						<FluxComponent flux={flux} connectToStores={[constants.MODEL_LIBRARY]} libName={constants.MODEL_LIBRARY}>
							<ModelLibrary url='data/models.json' title='models' />
						</FluxComponent>
					</div>
					<div id="location-library">
						<FluxComponent flux={flux} connectToStores={[constants.LOCATION_LIBRARY]} libName={constants.LOCATION_LIBRARY}>
							<Library url='data/locations.json' title='locations' onAdd={handleAdd} />
						</FluxComponent>
					</div>
				</div>
			</div>
		);
	}
}


module.exports = DragDropContext(HTML5Backend)(App);

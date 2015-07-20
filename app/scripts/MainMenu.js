'use strict';

var React = require('react');
var DragSource = require('react-dnd').DragSource;
var helpers = require('./helpers.js');


function endDrag(props, monitor, component) {
	if (!monitor.didDrop()) { return; }
	let result = monitor.getDropResult();
	if (result.target === 'graph') {
		let interfaceStore = component.props.flux.getStore('interface');
		let xy = helpers.coordsRelativeToElem(interfaceStore.state.editorElem, result.clientOffset);
		let graphActions = component.props.flux.getActions('graph');
		graphActions.importModelFragment(monitor.getItem(), xy);
	}
}


// the props to be injected
function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
}


var nodeSpec = {
	beginDrag: function(props, monitor, component) {
		return {
			nodes: [
				{ id: ''+(new Date()) }
			]
		};
	},
	endDrag: endDrag
};
var DndNode = React.createClass({
	render: function() {
		const connectDragSource = this.props.connectDragSource;
		return connectDragSource(<div draggable={true} style={{ display: 'inline-block', background: 'lightgrey', marginLeft: '0.5em', padding: '2px' }}>node</div>);
	},
});
DndNode = DragSource('DndNode', nodeSpec, collect)(DndNode);


var fragmentSpec = {
	beginDrag: function(props, monitor, component) {
		const id0 = '0'+(new Date());
		const id1 = '1'+(new Date());
		const id2 = '2'+(new Date());
		const id3 = '3'+(new Date());
		let node1 = { id: id1, label: 'actor' };
		let node2 = { id: id2, label: 'room' };
		let node3 = { id: id3, label: 'firewall' };
		return {
			edges: [
				{ relation: 'relation', id: id0, from: node1, to: node2 }
			],
			nodes: [
				node1,
				node2,
				node3,
			],
			groups: [
				{ id: id0, name: 'model fragment',	 nodeIds: [id1, id2, id3] }
			],
		};
	},
	endDrag: endDrag
};
var DndFragment = React.createClass({
	render: function() {
		const connectDragSource = this.props.connectDragSource;
		return connectDragSource(<div draggable={true} style={{ display: 'inline-block', background: 'lightgrey', marginLeft: '0.5em', padding: '2px' }}>fragment</div>);
	},
});
DndFragment = DragSource('DndFragment', fragmentSpec, collect)(DndFragment);


var MainMenu = React.createClass({
	mixins: [],

	propTypes: {

	},

	getDefaultProps: function() {
		return {

		};
	},

	render: function() {
		var props = this.props;

		return (
			<div id={props.id}>
				<button onClick={this._toggleImages}>{(props.showImages) ? 'hide' : 'show'} images</button>
				<button onClick={this._toggleGroups}>{(props.showGroups) ? 'hide' : 'show'} groups</button>
				<button onClick={this._toggleEdges}>{(props.showEdges) ? 'hide' : 'show'} edges</button>
				<button onClick={this._resetTransformation}>reset transformation</button>
				<button onClick={this._autoLayout}>auto-layout</button>
				<DndNode {...props} />
				<DndFragment {...props} />
			</div>
		);
	},

	_toggleImages: function(event) {
		this._interfaceActions.setShowImages(!this.props.showImages);
	},

	_toggleGroups: function(event) {
		this._interfaceActions.setShowGroups(!this.props.showGroups);
	},

	_toggleEdges: function(event) {
		this._interfaceActions.setShowEdges(!this.props.showEdges);
	},

	_resetTransformation: function(event) {
		this._interfaceActions.setTransformation({
			scale: 1,
			panX: 0,
			panY: 0
		});
	},

	_autoLayout: function() {
		this._interfaceActions._autoLayout();
	},

	componentWillMount: function() {
		this._interfaceActions = this.props.flux.getActions('interface');
	},

});


module.exports = MainMenu;

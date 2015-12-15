'use strict';
let React = require('react');
let $ = require('jquery');
let mout = require('mout');
let GraphMixin = require('./GraphMixin.js');
let SchleppManagerMixin = require('./SchleppManagerMixin.js');
let SchleppMixin = require('./SchleppMixin.js');
let helpers = require('./helpers.js');
const constants = require('./constants.js');
let icons = require('./icons.js');
let DropTarget = require('react-dnd').DropTarget;


let GraphEditor = React.createClass({
	mixins: [
		SchleppMixin,
		SchleppManagerMixin,
		GraphMixin
	],

	getDefaultProps: function() {
		return {
			editable: true,
		};
	},

	componentDidMount: function() {
		const context = this.context;
		let $svg = $(this.getDOMNode()).find('svg');
		context.interfaceActions.setEditorElem($svg[0]);

		let that = this;
		$svg.on('contextmenu', function(event) {
			const menuItems = [ // TODO: have these all in one place?
				{
					label: 'add group',
					icon: icons['fa-plus'],
					action: function(/*event*/) {
						const group = {
							x: event.offsetX,
							y: event.offsetY,
						};
						context.graphActions.addGroup(group);
					}
				}
			];
			context.interfaceActions.showContextMenu(event, that.props.graph, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		let $svg = $(this.props.editorElem);
		$svg.off('contextmenu');
		this.context.interfaceActions.setEditorElem(null);
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		const context = this.context;
		context.interfaceActions.hideContextMenu();
		context.interfaceActions.select(null);
	},

	_onWheel: function(event) {
		event.preventDefault();

		const props = this.props;
		const context = this.context;

		let deltaScale = -event.deltaY / 2000.0;
		let newScale = mout.math.clamp(this.props.scale + deltaScale,
									   props.minZoom,
									   props.maxZoom);

		// event position, relative to svg elem
		const editorXY = helpers.coordsRelativeToElem(
			props.editorElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		// zoom and pan transform-origin equivalent
		// (from the-graph-app.js)
		const scaleD = newScale / props.scale;
		const currentX = props.panX;
		const currentY = props.panY;
		const x = scaleD * (currentX - editorXY.x) + editorXY.x;
		const y = scaleD * (currentY - editorXY.y) + editorXY.y;

		context.interfaceActions.setTransformation({
			scale: newScale,
			panX: x,
			panY: y,
		});
	},

	_onDragStart: function(event) {
		this._originalPanX = this.props.panX;
		this._originalPanY = this.props.panY;
	},

	_onDragMove: function(event) {
		this.context.interfaceActions.setTransformation({
			panX: this._originalPanX + event.deltaX,
			panY: this._originalPanY + event.deltaY,
		});
	},

	_onDragEnd: function(event) {
		this._originalPanX = this.props.panX;
		this._originalPanY = this.props.panY;
	},
});


const spec = {
	drop: function (props, monitor, component) {
		// console.log(monitor.getItem());
		const clientOffset = monitor.internalMonitor.store.getState().dragOffset.clientOffset;
		return {
			target: constants.DND_TARGET_MAP,
			clientOffset
		};
	}
};


// the props to be injected
function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
}


GraphEditor = DropTarget(
	[
		constants.DND_SOURCE_NODE,
		constants.DND_SOURCE_FRAGMENT
	],
	spec,
	collect
)(GraphEditor);


module.exports = GraphEditor;

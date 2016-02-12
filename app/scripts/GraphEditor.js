'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const mout = require('mout');

const GraphMixin = require('./GraphMixin.js');
const SchleppManagerMixin = require('./SchleppManagerMixin.js');
const SchleppMixin = require('./SchleppMixin.js');
const helpers = require('./helpers.js');
const constants = require('./constants.js');
const icons = require('./icons.js');
const actionCreators = require('./actionCreators.js');
const DropTarget = require('react-dnd').DropTarget;


let GraphEditor = React.createClass({
	mixins: [
		SchleppMixin,
		SchleppManagerMixin,
		GraphMixin
	],

	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
	},

	getDefaultProps: function() {
		return {
			editable: true,
		};
	},

	_onContextMenu: function(event) {
		const props = this.props;

		const menuItems = [
			{
				label: 'add group',
				icon: icons['fa-plus'],
				action: function(/*event*/) {
					const group = {
						x: event.clientX,
						y: event.clientY,
					};
					props.dispatch( actionCreators.addGroup(group) );
				}
			},
			{
				label: 'auto-layout',
				icon: icons['fa-magic'],
				action: function(/*event*/) {
					props.dispatch( actionCreators.autoLayout() );
				}
			},
			{
				label: 'reset\nview',
				icon: icons['fa-sliders'],
				action: function(/*event*/) {
					props.dispatch( actionCreators.resetTransformation() );
				}
			},
		];
		props.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		const props = this.props;
		props.dispatch( actionCreators.hideContextMenu() );
		props.dispatch( actionCreators.select(null) );
	},

	_onWheel: function(event) {
		event.preventDefault();
		const props = this.props;

		const deltaScale = -event.deltaY / 2000.0;
		const newScale = mout.math.clamp(
			this.props.scale + deltaScale,
			props.minZoom,
			props.maxZoom
		);

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

		props.dispatch(
			actionCreators.setTransformation({
				scale: newScale,
				panX: x,
				panY: y,
			})
		);
	},

	_onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		const props = this.props;
		props.dispatch( actionCreators.setMouseOverEditor(true) );

		if (props.drag) {
			(props.drag.onMove || helpers.noop)(event);
		}
	},

	_onMouseLeave: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.dispatch( actionCreators.setMouseOverEditor(false) );
	},

	_onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		const props = this.props;
		if (props.drag) {
			(props.drag.onEnd || helpers.noop)(event);
		}
		props.dispatch( actionCreators.setDrag(null) );
		props.dispatch( actionCreators.setPanning(false) );
	},

	_onDragStart: function(event) {
		const props = this.props;
		this._originalPanX = props.panX;
		this._originalPanY = props.panY;
	},

	_onDragMove: function(event) {
		this.props.dispatch(
			actionCreators.setTransformation({
				panX: this._originalPanX + event._deltaX,
				panY: this._originalPanY + event._deltaY,
			})
		);
	},

	_onDragEnd: function(event) {
		const props = this.props;
		this._originalPanX = props.panX;
		this._originalPanY = props.panY;
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


const types = [
	constants.DND_SOURCE_NODE,
	constants.DND_SOURCE_FRAGMENT
];
GraphEditor = DropTarget(types, spec, collect)(GraphEditor);


module.exports = GraphEditor;

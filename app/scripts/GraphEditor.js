'use strict';

let React = require('react');
let reactDOM = require('react-dom');
let $ = require('jquery');
let mout = require('mout');
let GraphMixin = require('./GraphMixin.js');
let SchleppManagerMixin = require('./SchleppManagerMixin.js');
let SchleppMixin = require('./SchleppMixin.js');
let helpers = require('./helpers.js');
const constants = require('./constants.js');
let icons = require('./icons.js');
let actionCreators = require('./actionCreators.js');
let DropTarget = require('react-dnd').DropTarget;


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

	componentDidMount: function() {
		const props = this.props;

		const elem = reactDOM.findDOMNode(this);
		let $svg = $(elem).find('svg');

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
						props.dispatch( actionCreators.addGroup(group) );
					}
				}
			];
			props.dispatch( actionCreators.showContextMenu(event, that.props.graph, menuItems) );
			return false;
		});
	},

	componentWillUnmount: function() {
		let $svg = $(this.props.editorElem);
		$svg.off('contextmenu');
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

		props.dispatch(
			actionCreators.setTransformation({
				scale: newScale,
				panX: x,
				panY: y,
			})
		);
	},

	_onDragStart: function(event) {
		const props = this.props;
		this._originalPanX = props.panX;
		this._originalPanY = props.panY;
	},

	_onDragMove: function(event) {
		this.props.dispatch(
			actionCreators.setTransformation({
				panX: this._originalPanX + event.deltaX,
				panY: this._originalPanY + event.deltaY,
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

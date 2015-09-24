'use strict';

var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var mout = require('mout');
var classnames = require('classnames');
var helpers = require('./helpers.js');
var constants = require('./constants.js');
var SchleppManagerMixin = require('./SchleppManagerMixin.js');
var SchleppMixin = require('./SchleppMixin.js');
var Group = require('./Group.js');
var Node = require('./Node.js');
var Edge = require('./Edge.js');
var BackgroundImage = require('./BackgroundImage.js');
var ContextMenu = require('./ContextMenu.js');
var DropTarget = require('react-dnd').DropTarget;
var icons = require('./icons.js');


var GraphMixin = {
	// mixins: [PureRenderMixin],

	propTypes: {
		graph: React.PropTypes.object.isRequired,
		editable: React.PropTypes.bool.isRequired,
		isMinimap: React.PropTypes.bool.isRequired,
		minZoom: React.PropTypes.number,
		maxZoom: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			minZoom: 0.2,
			maxZoom: 5.0,
			isMinimap: false,
		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	_makeGroup: function(group) {
		const props = this.props;

		let bounds = null;
		const extraPadding = 5;

		if (group.nodeIds.length === 0) {
			const xOffset = group.x || 0;
			const yOffset = group.y || 0;
			const s = props.theme.node.size*0.5 + 2*extraPadding;
			bounds = { // TODO: improve this
				minX: xOffset + extraPadding,
				minY: yOffset + extraPadding,
				maxX: xOffset + s,
				maxY: yOffset + s,
			};
		} else {
			bounds = helpers.getGroupBBox(props.graph.nodes, group);
			const s = props.theme.node.size*0.5 + extraPadding;
			bounds.minX -= s;
			bounds.minY -= s;
			bounds.maxX += s;
			bounds.maxY += s;
		}

		return <Group
				{...props}
				key={group.id}
				hovered={props.hoverGroup && (group.id === props.hoverGroup.id)}
				selected={props.selected && (group.id === props.selected.it.id)}
				group={group}
				x={bounds.minX}
				y={bounds.minY}
				width={bounds.maxX-bounds.minX}
				height={bounds.maxY-bounds.minY} />;
	},

	_makePreviewEdge: function(edge, index, collection) {
		return this._makeEdge(edge, index, collection, true);
	},

	_makeEdge: function(edge, index, collection, isPreview) {
		const props = this.props;
		return <Edge
				{...props}
				key={index}
				edge={edge}
				selected={props.selected && (edge.id === props.selected.it.id)}
				preview={isPreview} />;
	},

	_makeNode: function(node, index) {
		const props = this.props;
		return <Node
				{...this.props}
				key={index}
				hovered={props.hoverNode && (node.id === props.hoverNode.id)}
				selected={props.selected && (node.id === props.selected.it.id)}
				x={node.x}
				y={node.y}
				node={node} />;
	},

	_makeBgImage: function(group, index) {
		return <BackgroundImage
				{...this.props}
				key={index}
				group={group}
				groupCenterOffsetX={group._bgImage.groupCenterOffsetX}
				groupCenterOffsetY={group._bgImage.groupCenterOffsetY}
				width={group._bgImage.width || 500}
				height={group._bgImage.height || 500} />;
	},

	renderVisibleRect: function() {
		const props = this.props;

		if (props.isMinimap && props.visibleRect) {
			return (
				<g transform={'translate('+props.visibleRect.x+','+props.visibleRect.y+')'}>
					<rect
						className='minimap-visible-rect'
						strokeWidth={props.theme.minimap.viewport.strokeWidth / props.constantScale}
						width={props.visibleRect.width}
						height={props.visibleRect.height}>
					</rect>
				</g>
			);
		} else {
			return null;
		}
	},

	_renderMap: function() {
		var props = this.props;
		var graph = props.graph;

		return (
			/* prevent event propagation from map up to svg elem */
			<g ref='map-group' onClick={ function(event) { event.stopPropagation(); } }>
				{graph.groups.filter(function(group) { return !!group._bgImage; }).map(this._makeBgImage)}
				{graph.groups.map(this._makeGroup)}
				{graph.edges.map(this._makeEdge)}
				{ (props.previewEdge && !props.isMinimap)
					? [props.previewEdge].map(this._makePreviewEdge)
					: null
				}
				{graph.nodes.map(this._makeNode)}
				{this.renderVisibleRect()}
			</g>
		);
	},

	_render: function() {
		var props = this.props;
		var graph = props.graph;

		var scale = (props.isMinimap) ? props.constantScale : props.scale;
		var panX = (props.isMinimap) ? (props.panX * props.constantScale) : props.panX;
		var panY = (props.isMinimap) ? (props.panY * props.constantScale) : props.panY;

		if (props.isMinimap) {
			// TODO: s.th. goes wrong here when map is empty
			panX = panX || 0;
			panY = panY || 0;
		}

		var classNames = classnames(
			'graph',
			{
				'editable': props.editable,
				'not-editable': !props.editable,
			}
		);

		return (
			<div id={props.id} className='graph-container'>
				<svg
					ref='dragRoot'
					className={classNames}
					onWheel={this._onWheel || helpers.noop}
					onClick={this._onClick || helpers.noop}
				>
					<g ref='panZoom'
					   transform={'matrix('+scale+',0,0,'+scale+','+panX+','+panY+')'}>
						{this._renderMap()}
					</g>
					{(props.editable) ? <ContextMenu {...this.props} /> : null}
				</svg>
			</div>
		);
	},

	render: function() {
		var props = this.props;
		const connectDropTarget = props.connectDropTarget || _.identity;
		return connectDropTarget(this._render());
	},


	// updateDimensions: function() {
	// 	var $window = $(window);
	// 	this.setState({ // TODO: unused
	// 		width: $window.width(),
	// 		height: $window.height()
	// 	});
	// },
	// componentDidMount: function() {
	// 	this.updateDimensions();
	// 	window.addEventListener('resize', this.updateDimensions);
	// },
	// componentWillUnmount: function() {
	// 	window.removeEventListener('resize', this.updateDimensions);
	// }
};


var GraphEditor = React.createClass({
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

		var that = this;
		$svg.on('contextmenu', function(event) {
			let menuItems = [ // TODO: have these all in one place?
				{
					label: 'add group',
					icon: icons['fa-plus'],
					action: function(/*event*/) {
						let group = {
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
		var scaleD = newScale / props.scale;
		var currentX = props.panX;
		var currentY = props.panY;
		var x = scaleD * (currentX - editorXY.x) + editorXY.x;
		var y = scaleD * (currentY - editorXY.y) + editorXY.y;

		context.interfaceActions.setTransformation({
			scale: newScale,
			panX: x,
			panY: y,
		});
	},

	_onDragStart: function(event) {
		let $svg = $(this.props.editorElem);
		$svg.addClass('panning');
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
		let $svg = $(this.props.editorElem);
		$svg.removeClass('panning');
		this._originalPanX = this.props.panX;
		this._originalPanY = this.props.panY;
	},
});


var Graph = React.createClass({
	mixins: [GraphMixin],

	getDefaultProps: function() {
		return {
			editable: false,
		};
	},
});


var GraphMinimap = React.createClass({
	propTypes: {
		constantScale: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			//
		};
	},

	render: function() {
		const props = this.props;

		let transform = {
			scale: props.constantScale,
			pan: { x: 0, y: 0 }
		};

		if (!transform.scale) {
			if (!this.size) { return null; }

			let bbox = helpers.getNodesBBox(props.graph.nodes);

			// add some padding
			const padding = props.theme.node.size;
			bbox.minX -= padding;
			bbox.maxX += padding;
			bbox.minY -= padding;
			bbox.maxY += padding;
			const bboxSize = {
				width:  bbox.maxX - bbox.minX,
				height: bbox.maxY - bbox.minY,
			};
			const bboxAspectRatio = bboxSize.width / bboxSize.height;
			const fit = (this.aspectRatio > bboxAspectRatio) ? 'height' : 'width';
			const scale = this.size[fit] / bboxSize[fit];

			transform.scale = scale;
			transform.pan.x = -bbox.minX;
			transform.pan.y = -bbox.minY;
		}

		const showNodeLabels = false;
		const showEdgeLabels = false;
		const showGroupLabels = false;

		return (
			<div ref='height' id={props.id} className='panel-section'>
				<Graph {...props}
					isMinimap={true}
					constantScale={transform.scale}
					panX={transform.pan.x}
					panY={transform.pan.y}
					showNodeLabels={showNodeLabels}
					showEdgeLabels={showEdgeLabels}
					showGroupLabels={showGroupLabels} />
			</div>
		);
	},

	_setSize: function() {
		const props = this.props;

		let $minimap = $(this.getDOMNode());
		this.size = {
			width: $minimap.width(),
			height: $minimap.height(),
		};
		this.aspectRatio = this.size.width / this.size.height;
	},

	componentDidMount: function() {
		this._setSize();
	},

	componentDidUpdate: function() {
		this._setSize();
	},
});


var spec = {
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


module.exports = {
	Graph,
	GraphEditor: DropTarget([constants.DND_SOURCE_NODE, constants.DND_SOURCE_FRAGMENT], spec, collect)(GraphEditor),
	GraphMinimap,
};

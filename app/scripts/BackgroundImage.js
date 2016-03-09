'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const SchleppMixin = require('./SchleppMixin.js');
const helpers = require('./helpers.js');
const icons = require('./icons.js');
const actionCreators = require('./actionCreators.js');


const ResizeElem = React.createClass({
	mixins: [SchleppMixin],

	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	render: function() {
		const props = this.props;
		const halfSize = 0.5 * props.size;

		return <circle
			cx={props.x + halfSize}
			cy={props.y + halfSize}
			r={halfSize}
			style={{ opacity: 1 }}
			fill='white' />;
	},

	_onDragMove: function(event) {
		const props = this.props;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		const w = modelXYEvent.x - props.imgX;
		const h = modelXYEvent.y - props.imgY;

		const w1 = w;
		const h1 = w / props.aspectRatio;
		const h2 = h;
		const w2 = h * props.aspectRatio;

		this.context.dispatch(
			actionCreators.resizeGroupBackgroundImage(
				props.group.id,
				Math.max(w1, w2),
				Math.max(h1, h2)
			)
		);
	}
});


const Group = React.createClass({
	mixins: [SchleppMixin],

	propTypes: {
		groupCenterOffsetX: React.PropTypes.number.isRequired,
		groupCenterOffsetY: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		theme: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			groupCenterOffsetX: 0,
			groupCenterOffsetY: 0,
		};
	},

	render: function() {
		const props = this.props;
		if (!props.showImages || !props.showGroups) { return null; }

		// TODO: DRY
		let bounds = helpers.getGroupBBox(props.graph.nodes, props.group);
		const halfNodeSize = props.theme.node.size * 0.5;
		bounds.minX -= halfNodeSize;
		bounds.minY -= halfNodeSize;
		bounds.maxX += halfNodeSize;
		bounds.maxY += halfNodeSize;
		const groupCenter = {
			x: bounds.minX + (bounds.maxX - bounds.maxX) * 0.5,
			y: bounds.minY + (bounds.maxY - bounds.maxY) * 0.5,
		};
		const x = groupCenter.x + props.groupCenterOffsetX;
		const y = groupCenter.y + props.groupCenterOffsetY;

		const width = props.width;
		const height = props.height;
		const aspectRatio = width / height;

		const img = `<image class="background-image" xlink:href="${props.group._bgImage.url}" x="0" y="0" height="${height}" width="${width}"/>`;

		return (
			<g transform={`translate(${x}, ${y})`}
				onContextMenu={this._onContextMenu}
				onMouseEnter={this._onMouseOver}
				onMouseLeave={this._onMouseOut}>
				<g dangerouslySetInnerHTML={{ __html: img }}></g>
				{this.renderResizeElem(x, y, aspectRatio)}
			</g>
		);
	},

	renderResizeElem: function(imgX, imgY, aspectRatio) {
		if (!this.state.hover) { return null; }
		const props = this.props;
		const size = 50;
		return <ResizeElem
			{...props}
			x={props.width-size}
			y={props.height-size}
			imgX={imgX}
			imgY={imgY}
			aspectRatio={aspectRatio}
			size={size} />;
	},

	getInitialState: function() {
		return {
			hover: false
		};
	},

	_onContextMenu: function(event) {
		const context = this.context;
		const props = this.props;
		const menuItems = [
			{
				label: 'convert to nodes',
				icon: icons['fa-magic'],
				action: function() {
					context.dispatch( actionCreators.backgroundImageToNodes(props.group) );
				}
			}
		];
		context.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},

	_onMouseOver: function(event) {
		this.setState({ hover: true });
	},

	_onMouseOut: function(event) {
		this.setState({ hover: false });
	},

	_onDragStart: function(event) {
		const props = this.props;
		this.originalPositionX = props.groupCenterOffsetX;
		this.originalPositionY = props.groupCenterOffsetY;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		this.context.dispatch(
			actionCreators.moveGroupBackgroundImage(
				props.group.id,
				{
					x: this.originalPositionX + modelXYDelta.x,
					y: this.originalPositionY + modelXYDelta.y
				}
			)
		);
	},

	_onDragEnd: function(event) {
		//
	}
});


module.exports = Group;

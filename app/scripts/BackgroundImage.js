'use strict';

var $ = require('jquery');
var React = require('react');
var SchleppMixin = require('./SchleppMixin.js');
var helpers = require('./helpers.js');
var icons = require('./icons.js');


var ResizeElem = React.createClass({
	mixins: [SchleppMixin],

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
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
		const context = this.context;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);

		const w = modelXYEvent.x - props.imgX;
		const h = modelXYEvent.y - props.imgY;

		const w1 = w;
		const h1 = w / props.aspectRatio;
		const h2 = h;
		const w2 = h * props.aspectRatio;

		context.interfaceActions.resizeGroupBackgroundImage(
			props.group,
			Math.max(w1, w2),
			Math.max(h1, h2)
		);
	}
});


var Group = React.createClass({
	mixins: [SchleppMixin],

	propTypes: {
		groupCenterOffsetX: React.PropTypes.number.isRequired,
		groupCenterOffsetY: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		theme: React.PropTypes.object.isRequired,
		flux: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			groupCenterOffsetX: 0,
			groupCenterOffsetY: 0,
		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	render: function() {
		var props = this.props;
		if (!props.showImages || !props.showGroups) { return null; }

		// TODO: DRY
		var bounds = helpers.getGroupBBox(props.graph.nodes, props.group);
		bounds.minX -= props.theme.node.size*0.5;
		bounds.minY -= props.theme.node.size*0.5;
		bounds.maxX += props.theme.node.size*0.5;
		bounds.maxY += props.theme.node.size*0.5;
		var groupCenter = {
			x: bounds.minX + (bounds.maxX - bounds.maxX) * 0.5,
			y: bounds.minY + (bounds.maxY - bounds.maxY) * 0.5,
		};
		var x = groupCenter.x + props.groupCenterOffsetX;
		var y = groupCenter.y + props.groupCenterOffsetY;

		var width = props.width;
		var height = props.height;
		var aspectRatio = width / height;

		var img = '<image class="background-image" xlink:href="'+props.group._bgImage.url+'" x="'+0+'" y="'+0+'" height="'+height+'" width="'+width+'"/>';

		return (
			<g transform={'translate('+x+','+y+')'}
				onMouseEnter={this._onMouseOver}
				onMouseLeave={this._onMouseOut}>
				<g dangerouslySetInnerHTML={{ __html: img }}></g>
				{this.renderResizeElem(x, y, aspectRatio)}
			</g>
		);
	},

	renderResizeElem: function(imgX, imgY, aspectRatio) {
		if (!this.state.hover) { return null; }
		var props = this.props;
		var size = 50;
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

	componentDidMount: function() {
		const props = this.props;
		const context = this.context;
		const elem = this.getDOMNode();
		$(elem).on('contextmenu', function(event) {
			let menuItems = [
				{
					label: 'convert to nodes',
					icon: icons['fa-magic'],
					action: function() { context.interfaceActions.backgroundImageToNodes(props.group); }
				}
			];
			context.interfaceActions.showContextMenu(event, props.group, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		$(this.getDOMNode()).off('contextmenu');
	},

	_onMouseOver: function(event) {
		this.setState({ hover: true });
	},

	_onMouseOut: function(event) {
		this.setState({ hover: false });
	},

	_onDragStart: function(event) {
		this.originalPositionX = this.props.groupCenterOffsetX;
		this.originalPositionY = this.props.groupCenterOffsetY;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			this.props.editorElem,
			this.props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;
		const context = this.context;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		context.interfaceActions.moveImage(
			this.props.group,
			{
				groupCenterOffsetX: this.originalPositionX + modelXYDelta.x,
				groupCenterOffsetY: this.originalPositionY + modelXYDelta.y
			}
		);
	},

	_onDragEnd: function(event) {
		//
	}
});


module.exports = Group;

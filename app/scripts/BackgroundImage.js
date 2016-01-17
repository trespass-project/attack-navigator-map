'use strict';

let $ = require('jquery');
let React = require('react');
let reactDOM = require('react-dom');
let SchleppMixin = require('./SchleppMixin.js');
let helpers = require('./helpers.js');
let icons = require('./icons.js');
let actionCreators = require('./actionCreators.js');


let ResizeElem = React.createClass({
	mixins: [SchleppMixin],

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
			{ x: event.offsetX,
			  y: event.offsetY }
		);

		const w = modelXYEvent.x - props.imgX;
		const h = modelXYEvent.y - props.imgY;

		const w1 = w;
		const h1 = w / props.aspectRatio;
		const h2 = h;
		const w2 = h * props.aspectRatio;

		props.dispatch(
			actionCreators.resizeGroupBackgroundImage(
				props.group.id,
				Math.max(w1, w2),
				Math.max(h1, h2)
			)
		);
	}
});


let Group = React.createClass({
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

		const img = '<image class="background-image" xlink:href="'+props.group._bgImage.url+'" x="'+0+'" y="'+0+'" height="'+height+'" width="'+width+'"/>';

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

	componentDidMount: function() {
		let that = this;
		const elem = reactDOM.findDOMNode(this);

		$(elem).on('contextmenu', function(event) {
			const menuItems = [
				{
					label: 'convert to nodes',
					icon: icons['fa-magic'],
					action: function() {
						that.props.dispatch( actionCreators.backgroundImageToNodes(that.props.group) );
					}
				}
			];
			that.props.dispatch( actionCreators.showContextMenu(event, menuItems) );
			return false;
		});
	},

	componentWillUnmount: function() {
		const elem = reactDOM.findDOMNode(this);
		$(elem).off('contextmenu');
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
			{ x: event.offsetX,
			  y: event.offsetY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

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

		props.dispatch(
			actionCreators.moveImage(
				this.props.group,
				{
					groupCenterOffsetX: this.originalPositionX + modelXYDelta.x,
					groupCenterOffsetY: this.originalPositionY + modelXYDelta.y
				}
			)
		);
	},

	_onDragEnd: function(event) {
		//
	}
});


module.exports = Group;

'use strict';

var $ = require('jquery');
var React = require('react');
var classnames = require('classnames');
var SchleppMixin = require('./SchleppMixin.js');
var Port = require('./Port.js');
var icons = require('./icons.js');
var helpers = require('./helpers.js');


const typeIcons = {
	location: 'fa-square-o',
	asset: 'fa-file-o',
	actor: 'fa-male',
	role: 'fa-user',
	predicate: 'fa-tags',
	process: 'fa-gears',
	policy: 'fa-ban',
};


var Node = React.createClass({
	mixins: [SchleppMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		theme: React.PropTypes.object.isRequired,
		node: React.PropTypes.object.isRequired,
		flux: React.PropTypes.object.isRequired,
	},

	renderIcon: function() {
		if (!this.props.showGroupLabels) { return null; }
		const icon = icons[typeIcons[this.props.node.type]];
		return <text ref='icon' className='icon fa' x='0' y='2' dangerouslySetInnerHTML={{__html:icon}}></text>;
	},

	renderLabel: function() {
		if (!this.props.showGroupLabels) { return null; }
		return <text ref='label' className='label' x='0' y={2+this.props.theme.node.size*0.5}>{this.props.node.label || 'no label'}</text>;
	},

	render: function() {
		var props = this.props;
		var radius = props.theme.node.size * 0.5;

		var portStyle = {};
		if (!props.hovered) { portStyle.display = 'none'; }

		return (
			<g
				className='node-group'
				transform={'translate('+props.x+','+props.y+')'}
				onClick={this._onClick}
				onMouseEnter={this._handleHover}
				onMouseLeave={this._handleHoverOut}>
				<g ref='dragRoot'>
					<rect
						className={classnames('node', { 'hover': props.hovered })}
						x={-radius}
						y={-radius}
						rx={props.theme.node.cornerRadius}
						ry={props.theme.node.cornerRadius}
						height={radius*2}
						width={radius*2} />
					{this.renderLabel()}
					{this.renderIcon()}
				</g>
				<Port
					style={portStyle}
					{...this.props}
					x={0}
					y={-radius}
					size={props.theme.port.size}
					node={this.props.node} />
			</g>
		);
	},

	componentWillMount: function() {
		this._graphActions = this.props.flux.getActions('graph');
		this._interfaceActions = this.props.flux.getActions('interface');
	},

	componentDidMount: function() {
		var that = this;

		$(this.getDOMNode()).on('contextmenu', function(event) {
			let menuItems = [
				{
					label: 'delete',
					icon: icons['fa-trash'],
					action: function() { that._graphActions.removeNode(that.props.node); }
				}
			];
			that._interfaceActions.showContextMenu(event, that.props.group, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		$(this.getDOMNode()).off('contextmenu');
	},

	// _getLabelWidth: function() {
	// 	var label = this.refs.label.getDOMNode();
	// 	var bbox = label.getBBox();
	// 	var width = bbox.width;
	// 	return width;
	// },

	// _positionPorts: function() {
	// 	var w = this._getLabelWidth();
	// 	this.setState({
	// 		portPosX: props.theme.port.size+props.theme.label.fontSize+w*0.5
	// 	});
	// },

	// componentDidMount: function() {
	// 	// this._positionPorts();
	// },

	// componentDidUpdate: function() {
	// 	if (!this.state.portPosX)
	// 		this._positionPorts();
	// },

	// getInitialState: function() {
	// 	return {};
	// },

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this._interfaceActions.select(this.props.node, 'node');
	},

	_onDragStart: function(event) {
		const props = this.props;
		const node = props.node;

		this._interfaceActions.setDragNode(node);

		this.originalPositionX = node.x;
		this.originalPositionY = node.y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

		// get event coords in model space
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

		this._interfaceActions.moveNode(
			this.props.node, {
				x: this.originalPositionX + modelXYDelta.x,
				y: this.originalPositionY + modelXYDelta.y,
			}
		);
	},

	_onDragEnd: function(event) {
		this._interfaceActions.setDragNode(null);
	},

	_handleHover: function(event) {
		this._interfaceActions.setHoverNode(this.props.node);
	},

	_handleHoverOut: function(event) {
		this._interfaceActions.setHoverNode(null);
	}
});


module.exports = Node;
'use strict';

var $ = require('jquery');
var React = require('react');
var DraggableMixin = require('./DraggableMixin.js');
var Port = require('./Port.js');
var icons = require('./icons.js');


var Node = React.createClass({
	mixins: [DraggableMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		theme: React.PropTypes.object.isRequired,
		node: React.PropTypes.object.isRequired,
		flux: React.PropTypes.object.isRequired,
	},

	renderLabel: function() {
		if (!this.props.showGroupLabels) { return null; }
		return <text ref='label' className='label' x='0' y='0'>{this.props.node.label || 'no label'}</text>;
	},

	render: function() {
		var props = this.props;

		var radius = props.theme.node.size * 0.5;

		return (
			<g
				className='node-group'
				transform={'translate('+props.x+','+props.y+')'}
				onClick={this._onClick}
				onMouseEnter={this._handleHover}
				onMouseLeave={this._handleHoverOut}>
				<g ref='dragRoot'>
					<rect
						className='node'
						x={-radius}
						y={-radius}
						rx={props.theme.node.cornerRadius}
						ry={props.theme.node.cornerRadius}
						height={radius*2}
						width={radius*2} />
					{this.renderLabel()}
				</g>
				<Port
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
		var node = this.props.node;
		this.origialPositionX = node.x;
		this.origialPositionY = node.y;
		this._interfaceActions.setDragNode(node);
	},

	_onDragMove: function(event) {
		this._interfaceActions.moveNode(
			this.props.node, {
				x: this.origialPositionX + event.deltaX / this.props.scale,
				y: this.origialPositionY + event.deltaY / this.props.scale,
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

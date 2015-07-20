'use strict';

var React = require('react');
var DraggableMixin = require('./DraggableMixin.js');


var Port = React.createClass({
	mixins: [DraggableMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		size: React.PropTypes.number.isRequired,
		node: React.PropTypes.object.isRequired,
		flux: React.PropTypes.object.isRequired,
	},

	render: function() {
		var props = this.props;

		if (!props.editable) { return null; }

		return (
			<circle
				cx={props.x}
				cy={props.y}
				r={props.size*0.5}
				fill='white'
				stroke='black'
				strokeWidth='2' />
		);
	},

	componentWillMount: function() {
		this._graphActions = this.props.flux.getActions('graph');
		this._interfaceActions = this.props.flux.getActions('interface');
	},

	_onDragStart: function(event) {
		this._interfaceActions.setDragNode(this.props.node);
		this._onDragMove(event);
	},

	_onDragMove: function(event) {
		var that = this;
		var node = this.props.node;

		this._interfaceActions.setPreviewEdge({
			from: node,
			to: {
				x: node.x + that.props.x + event.deltaX / this.props.scale,
				y: node.y + that.props.y + event.deltaY / this.props.scale,
			},
		});
	},

	_onDragEnd: function(event) {
		var props = this.props;

		if (props.hoverNode != null && props.dragNode != null) {
			var newEdge = {
				from: props.dragNode,
				to: props.hoverNode
			};
			this._graphActions.addEdge(newEdge);
		}
		this._interfaceActions.setPreviewEdge(null);
		this._interfaceActions.setDragNode(null);
	}
});


module.exports = Port;

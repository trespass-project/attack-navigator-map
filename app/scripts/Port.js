'use strict';

var React = require('react');
var SchleppMixin = require('./SchleppMixin.js');
var helpers = require('./helpers.js');


var Port = React.createClass({
	mixins: [SchleppMixin],

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
				style={props.style}
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
		const props = this.props;
		const node = props.node;

		this._interfaceActions.setDragNode(node);

		// this._onDragMove(event);
	},

	_onDragMove: function(event) {
		const props = this.props;
		const node = props.node;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);

		this._interfaceActions.setPreviewEdge({
			from: node,
			to: {
				x: modelXYEvent.x,
				y: modelXYEvent.y,
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

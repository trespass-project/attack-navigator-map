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

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	render: function() {
		var props = this.props;

		if (!props.editable) { return null; }

		return (
			<circle
				className='port'
				style={props.style}
				cx={props.x}
				cy={props.y}
				r={props.size*0.5} />
		);
	},

	_onDragStart: function(event) {
		const props = this.props;
		const node = props.node;

		this.context.interfaceActions.setDragNode(node);

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

		this.context.interfaceActions.setPreviewEdge({
			from: node,
			to: {
				x: modelXYEvent.x,
				y: modelXYEvent.y,
			},
		});
	},

	_onDragEnd: function(event) {
		const props = this.props;
		const context = this.context;

		if (props.hoverNode != null && props.dragNode != null) {
			var newEdge = {
				from: props.dragNode,
				to: props.hoverNode
			};
			context.graphActions.addEdge(newEdge);
		}
		context.interfaceActions.setPreviewEdge(null);
		context.interfaceActions.setDragNode(null);
	}
});


module.exports = Port;

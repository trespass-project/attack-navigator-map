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

		var iconHTML = { __html: '&#xf100;' };

		return (
			<g
				style={props.style}
				className='port-group'
				transform={'translate('+props.x+','+props.y+')'}
			>
				<circle
					className='port'
					cx={0}
					cy={0}
					r={props.size*0.5}
				/>
				<text dy='1' className='spiral' dangerouslySetInnerHTML={iconHTML}></text>
			</g>
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
			from: node.id,
			to: { // this is an exception
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
				from: props.dragNode.id,
				to: props.hoverNode.id
			};
			context.graphActions.addEdge(newEdge);
			context.interfaceActions.select(newEdge, 'edge');
		}
		context.interfaceActions.setPreviewEdge(null);
		context.interfaceActions.setDragNode(null);
	}
});


module.exports = Port;

'use strict';

let React = require('react');
let SchleppMixin = require('./SchleppMixin.js');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


let Port = React.createClass({
	mixins: [SchleppMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		size: React.PropTypes.number.isRequired,
		node: React.PropTypes.object.isRequired,
		style: React.PropTypes.object.isRequired,
		dispatch: React.PropTypes.func.isRequired,
		editorElem: React.PropTypes.object.isRequired,
		editorTransformElem: React.PropTypes.object.isRequired,
		hoverNode: React.PropTypes.object/*.isRequired*/,
		dragNode: React.PropTypes.object/*.isRequired*/,
	},

	getDefaultProps: function() {
		return {
			style: {}
		};
	},

	render: function() {
		const props = this.props;
		const iconHTML = { __html: '&#xf100;' };

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

		props.dispatch( actionCreators.setDragNode(node) );
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

		props.dispatch(
			actionCreators.setPreviewEdge({
				from: node.id,
				to: { // this is an exception
					x: modelXYEvent.x,
					y: modelXYEvent.y,
				},
			})
		);
	},

	_onDragEnd: function(event) {
		const props = this.props;

		if (props.hoverNode != null && props.dragNode != null) {
			const newEdge = {
				from: props.dragNode.id,
				to: props.hoverNode.id
			};
			props.dispatch( actionCreators.addEdge(newEdge) );
			props.dispatch( actionCreators.select(newEdge, 'edge') );
		}
		props.dispatch( actionCreators.setPreviewEdge(null) );
		props.dispatch( actionCreators.setDragNode(null) );
	}
});


module.exports = Port;

'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var d3 = require('d3');
var $ = require('jquery');
var mout = require('mout');
var classnames = require('classnames');
var icons = require('./icons.js');
var helpers = require('./helpers.js');


var diagonal = d3.svg.diagonal()
	.source(function(d) { return d.fromNode; })
	.target(function(d) { return d.toNode; });


// from processing
function _bezierPoint(a, b, c, d, t) {
	const t1 = 1.0 - t;
	return a*t1*t1*t1 + 3*b*t*t1*t1 + 3*c*t*t*t1 + d*t*t*t;
}

function bezierPoint(p1, /*c1, c2, */p2, t) {
	var m = (p1.y + p2.y) / 2;
	var c1 = { x: p1.x, y: m };
	var c2 = { x: p2.x, y: m };

	var x = _bezierPoint(p1.x, c1.x, c2.x, p2.x, t);
	var y = _bezierPoint(p1.y, c1.y, c2.y, p2.y, t);

	return {
		x: x,
		y: y
	};
}



var Edge = React.createClass({
	// mixins: [PureRenderMixin],

	propTypes: {
		edge: React.PropTypes.object.isRequired,
		theme: React.PropTypes.object.isRequired,
		preview: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			preview: false
		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	renderLabel: function(edgeNodes) {
		const props = this.props;
		const edge = props.edge;

		if (!props.showEdgeLabels) { return null; }

		const t = 0.5;
		var center = {
			x: mout.math.lerp(t, edgeNodes.fromNode.x, edgeNodes.toNode.x),
			y: mout.math.lerp(t, edgeNodes.fromNode.y, edgeNodes.toNode.y),
		};

		let label = edge.relation || '';
		label = helpers.ellipsize(15, label);

		return <text
			onClick={this._onClick}
			className='label'
			x={center.x}
			y={center.y}>{label}</text>;
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.interfaceActions.select(this.props.edge, 'edge');
	},

	render: function() {
		const props = this.props;
		const edge = props.edge;

		if (!props.showEdges) { return null; }

		// look up actual nodes by id
		let edgeNodes = {
			fromNode: helpers.getItemById(props.graph.nodes, edge.from),
		};
		// in preview edges 'to' is not an id,
		// an actual object, with x and y properties.
		if (props.preview) {
			edgeNodes.toNode = edge.to;
		} else {
			edgeNodes.toNode = helpers.getItemById(props.graph.nodes, edge.to);
		}

		// both nodes need to exist, obviously
		if (!edgeNodes.fromNode || !edgeNodes.toNode) {
			console.warn('ignoring edge with missing nodes');
			return null;
		}

		let arrow = null; // TODO: clean up all of this!
		if (edge.directed) {
			arrow = bezierPoint(edgeNodes.fromNode, edgeNodes.toNode, 0.75);
			var size = 10;
			var x = arrow.x;
			var y = arrow.y;

			var d = 'M'+(size*0.5)+','+(0);
			d += ' L'+(size*-0.5)+','+(size*0.5);
			d += ' L'+(size*-0.5)+','+(size*-0.5);
			d += ' Z';

			var angleDeg = Math.atan2(edgeNodes.toNode.y - edgeNodes.fromNode.y, edgeNodes.toNode.x - edgeNodes.fromNode.x) * 180 / Math.PI;

			arrow = (
				<g transform={'translate('+x+','+y+') rotate('+angleDeg+')'}>
					<path d={d} />
				</g>
			);
		}

		return (
			<g className='edge-group'
				onClick={this._onClick}>
				<path
					className={classnames('edge', {'preview': props.preview})}
					d={diagonal(edgeNodes)}
					stroke={(props.preview) ? props.theme.previewEdge.stroke : props.theme.edge.stroke}
					strokeWidth={props.theme.edge.strokeWidth} />
				{arrow}
				{this.renderLabel(edgeNodes)}
			</g>
		);
	},

	componentDidMount: function() {
		var that = this;

		$(this.getDOMNode()).on('contextmenu', function(event) {
			let menuItems = [
				{
					label: 'delete',
					icon: icons['fa-trash'],
					action: function() { that.context.graphActions.removeEdge(that.props.edge); }
				}
			];
			that.context.interfaceActions.showContextMenu(event, that.props.group, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		$(this.getDOMNode()).off('contextmenu');
	},
});


module.exports = Edge;

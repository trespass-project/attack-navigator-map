'use strict';

var React = require('react');
// var d3 = require('d3');
var $ = require('jquery');
var mout = require('mout');
var classnames = require('classnames');
var icons = require('./icons.js');
var helpers = require('./helpers.js');


// var diagonal = d3.svg.diagonal()
// 	.source(function(d) { return d.fromNode; })
// 	.target(function(d) { return d.toNode; });


function pathifyBezier(p1, c1, c2, p2) {
	return [
		'M', p1.x+','+p1.y,
		'C', c1.x+','+c1.y,
		     c2.x+','+c2.y,
		     p2.x+','+p2.y
	].join(' ');
}


function diagonalBezier(p1, p2) {
	// var m = (p1.y + p2.y) / 2;
	const m = p1.y + ((p2.y - p1.y) / 2);
	const c1 = { x: p1.x, y: m };
	const c2 = { x: p2.x, y: m };
	return { p1, c1, c2, p2 };
}


function arrowHead(size) {
	let path = 'M'+(size*0.5)+','+(0);
	path += ' L'+(size*-0.5)+','+(size*0.5);
	path += ' L'+(size*-0.5)+','+(size*-0.5);
	path += ' Z';
	return path;
}


function vectorAngle(x, y) {
	return Math.atan2(y, x);
}


function radians(angleDeg) {
	return angleDeg * 180 / Math.PI;
}


// from processing
function _bezierPoint(a, b, c, d, t) {
	const t1 = 1.0 - t;
	return a*t1*t1*t1 + 3*b*t*t1*t1 + 3*c*t*t*t1 + d*t*t*t;
}

function bezierPoint(p1, c1, c2, p2, t) {
	const x = _bezierPoint(p1.x, c1.x, c2.x, p2.x, t);
	const y = _bezierPoint(p1.y, c1.y, c2.y, p2.y, t);
	return { x, y };
}



var Edge = React.createClass({
	propTypes: {
		edge: React.PropTypes.object.isRequired,
		theme: React.PropTypes.object.isRequired,
		selected: React.PropTypes.bool,
		preview: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			preview: false,
			selected: false,
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

		let { p1, c1, c2, p2 } = diagonalBezier(edgeNodes.fromNode, edgeNodes.toNode);

		let arrow = null;
		if (edge.directed) {
			var arrowPosition = bezierPoint(p1, c1, c2, p2, 0.75);
			var size = 10;
			var x = arrowPosition.x;
			var y = arrowPosition.y;

			var arrowShape = arrowHead(size);

			var angleDeg = vectorAngle(edgeNodes.toNode.x - edgeNodes.fromNode.x, edgeNodes.toNode.y - edgeNodes.fromNode.y);
			angleDeg = radians(angleDeg);

			arrow = (
				<g transform={'translate('+x+','+y+') rotate('+angleDeg+')'}>
					<path d={arrowShape} />
				</g>
			);
		}

		return (
			<g className='edge-group'
				onClick={this._onClick}>
				<path
					className={classnames('edge', { 'preview': props.preview, 'selected': props.selected })}
					d={pathifyBezier(p1, c1, c2, p2)}
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

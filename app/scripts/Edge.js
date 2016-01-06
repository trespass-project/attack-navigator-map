'use strict';

let React = require('react');
let reactDOM = require('react-dom');
// let d3 = require('d3');
let $ = require('jquery');
let mout = require('mout');
let classnames = require('classnames');
let icons = require('./icons.js');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


// let diagonal = d3.svg.diagonal()
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
	// const m = (p1.y + p2.y) / 2;
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


let Edge = React.createClass({
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

	renderLabel: function(edgeNodes) {
		const props = this.props;
		const edge = props.edge;

		if (!props.showEdgeLabels) { return null; }

		const t = 0.5;
		const center = {
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
		const props = this.props;
		props.dispatch( actionCreators.select(props.edge, 'edge') );
	},

	render: function() {
		const props = this.props;
		const edge = props.edge;

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
			const arrowPosition = bezierPoint(p1, c1, c2, p2, 0.75);
			const size = 10;
			const x = arrowPosition.x;
			const y = arrowPosition.y;

			const arrowShape = arrowHead(size);

			let angleDeg = vectorAngle(edgeNodes.toNode.x - edgeNodes.fromNode.x, edgeNodes.toNode.y - edgeNodes.fromNode.y);
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
		let that = this;
		const props = this.props;

		const elem = reactDOM.findDOMNode(this);
		$(elem).on('contextmenu', function(event) {
			let menuItems = [
				{
					label: 'delete',
					icon: icons['fa-trash'],
					action: function() {
						props.dispatch( actionCreators.removeEdge(props.edge) );
					}
				}
			];
			props.dispatch( actionCreators.showContextMenu(event, props.group, menuItems) );
			return false;
		});
	},

	componentWillUnmount: function() {
		const elem = reactDOM.findDOMNode(this);
		$(elem).off('contextmenu');
	},
});


module.exports = Edge;

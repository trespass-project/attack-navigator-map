const React = require('react');
// const d3 = require('d3');
const R = require('ramda');
const mout = require('mout');
const classnames = require('classnames');
import { createSelector } from 'reselect';
const PureRenderMixin = require('react-addons-pure-render-mixin');
const icons = require('./icons.js');
const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');
const actionCreators = require('./actionCreators.js');


const getLabel = (edge) => edge.relation || '';
const getEdgeNodes = R.prop('edgeNodes');
const getP2 = R.prop('p2');

const arrowSize = 13;
const arrowShape = arrowHead(arrowSize);
const arrowShapePath = <path d={arrowShape} className='arrowhead' />;
const arrowDist = 40;


// const diagonal = d3.svg.diagonal()
// 	.source(function(d) { return d.fromNode; })
// 	.target(function(d) { return d.toNode; });


function pathifyBezier(p1, c1, c2, p2) {
	return [
		'M', `${p1.x}, ${p1.y}`,
		'C', `${c1.x}, ${c1.y}`,
		`${c2.x}, ${c2.y}`,
		`${p2.x}, ${p2.y}`
	].join(' ');
}


function diagonalBezier(p1, p2) {
	// const m = (p1.y + p2.y) / 2;
	// const m = p1.y + ((p2.y - p1.y) / 2);
	// const c1 = { x: p1.x, y: m };
	// const c2 = { x: p2.x, y: m };
	return {
		p1: p1,
		c1: p1,
		c2: p2,
		p2: p2,
	};
	// return { p1, c1, c2, p2 };
}


function arrowHead(size) {
	const halfSize = size * 0.5;
	return [
		'M', `${halfSize}, 0`,
		'L', `${-halfSize}, ${halfSize}`,
		'L', `${-halfSize}, ${-halfSize}`,
		'Z'
	].join(' ');
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


const Edge = React.createClass({
	contextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	mixins: [PureRenderMixin],

	propTypes: {
		// TODO: remove nodes dependency
		nodes: React.PropTypes.object.isRequired,
		edge: React.PropTypes.object.isRequired,
		isSelected: React.PropTypes.bool,
		isPreview: React.PropTypes.bool,
		isPredicate: React.PropTypes.bool,
		showEdgeLabels: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			isPreview: false,
			isPredicate: false,
			isSelected: false,
			showEdgeLabels: true,
		};
	},

	componentWillMount() {
		this.makeLabel = createSelector(
			getLabel,
			(label) => helpers.ellipsize(15, label)
		);

		this.calculateLinePoints = createSelector(
			getEdgeNodes,
			(edgeNodes) => diagonalBezier(edgeNodes.fromNode, edgeNodes.toNode)
		);

		this.calculateArrow = createSelector(
			getEdgeNodes,
			getP2,
			(edgeNodes, p2) => {
				const angle = vectorAngle(
					edgeNodes.toNode.x - edgeNodes.fromNode.x,
					edgeNodes.toNode.y - edgeNodes.fromNode.y
				);
				const angleDeg = radians(angle);

				// const arrowPosition = bezierPoint(p1, c1, c2, p2, 0.75);
				const arrowPosition = {
					x: p2.x + Math.cos(angle + Math.PI) * arrowDist,
					y: p2.y + Math.sin(angle + Math.PI) * arrowDist,
				};
				const { x, y } = arrowPosition;

				const arrow = <g
					transform={`translate(${x}, ${y}) rotate(${angleDeg})`}
				>
					{arrowShapePath}
				</g>;

				return { arrow, arrowPosition };
			}
		);
	},

	renderLabel(edgeNodes) {
		const props = this.props;
		const edge = props.edge;

		if (!props.showEdgeLabels) { return null; }

		const t = 0.5;
		const center = {
			x: mout.math.lerp(t, edgeNodes.fromNode.x, edgeNodes.toNode.x),
			y: mout.math.lerp(t, edgeNodes.fromNode.y, edgeNodes.toNode.y),
		};

		return <text
			onClick={this._onClick}
			className='label'
			x={center.x}
			y={center.y + 10}
		>
			{this.makeLabel(edge)}
		</text>;
	},

	_onClick(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.dispatch(
			actionCreators.select(this.props.edge.id, 'edge')
		);
	},

	render() {
		// const context = this.context;
		const props = this.props;
		const edge = props.edge;

		// look up actual nodes by id
		const edgeNodes = modelHelpers.getEdgeNodes(edge, props.nodes);
		// in preview edges 'to' is not an id,
		// an actual object, with x and y properties.
		if (props.isPreview) {
			edgeNodes.toNode = edge.to;
		}

		// both nodes need to exist, obviously
		if (!edgeNodes.fromNode || !edgeNodes.toNode) {
			// console.warn('ignoring edge with missing nodes'/*, edgeNodes.fromNode.id, edgeNodes.toNode.id*/);
			return null;
		}

		const { p1/*, c1, c2*/, p2 } = this.calculateLinePoints({ edgeNodes });

		const isDirected = !R.contains(edge.relation, modelHelpers.nonDirectedRelationTypes);

		let arrow = null;
		let arrowPosition = undefined;
		if (/*edge.directed*/ isDirected) {
			const a = this.calculateArrow({ edgeNodes, p2 });
			arrow = a.arrow;
			arrowPosition = a.arrowPosition;
		}

		const groupClasses = classnames(
			'edge-group',
			{ 'selected': props.isSelected }
		);

		const pathClasses = classnames(
			'edge',
			{
				'preview': props.isPreview,
				'selected': props.isSelected,
				'predicate': props.isPredicate
			}
		);

		return (
			<g
				className={groupClasses}
				onClick={this._onClick}
				onContextMenu={this._onContextMenu}
			>
				<line
					className={pathClasses}
					x1={p1.x}
					y1={p1.y}
					x2={(!!arrowPosition) ? arrowPosition.x : p2.x}
					y2={(!!arrowPosition) ? arrowPosition.y : p2.y}
				/>
				{/*<path
					className={pathClasses}
					d={pathifyBezier(p1, c1, c2, p2)}
				/>*/}
				{/*
					stroke={(props.isPreview)
						? context.theme.previewEdge.stroke
						: context.theme.edge.stroke
					}
					strokeWidth={context.theme.edge.strokeWidth}
				*/}
				{arrow}
				{this.renderLabel(edgeNodes)}
			</g>
		);
	},

	_onContextMenu(event) {
		const context = this.context;
		const props = this.props;
		const menuItems = [
			{
				label: 'delete',
				destructive: true,
				icon: icons['fa-trash'],
				action: () => {
					context.dispatch( actionCreators.removeEdge(props.edge.id) );
				}
			}
		];
		context.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},
});


module.exports = Edge;

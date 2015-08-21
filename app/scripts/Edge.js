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

		return (
			<g className='edge-group'
				onClick={this._onClick}>
				<path
					className={classnames('edge', {'preview': props.preview})}
					d={diagonal(edgeNodes)}
					stroke={(props.preview) ? props.theme.previewEdge.stroke : props.theme.edge.stroke}
					strokeWidth={props.theme.edge.strokeWidth} />
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

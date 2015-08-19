'use strict';

var React = require('react');
var d3 = require('d3');
var $ = require('jquery');
var mout = require('mout');
var classnames = require('classnames');
var icons = require('./icons.js');


var diagonal = d3.svg.diagonal()
	.source(function(d) { return d.from; })
	.target(function(d) { return d.to; });


var Edge = React.createClass({
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

	renderLabel: function() {
		const props = this.props;
		const edge = props.edge;

		if (!props.showEdgeLabels) { return null; }

		const t = 0.5;
		var center = {
			x: mout.math.lerp(t, edge.from.x, edge.to.x),
			y: mout.math.lerp(t, edge.from.y, edge.to.y),
		};
		return <text
			onClick={this._onClick}
			className='label'
			x={center.x}
			y={center.y}>{edge.relation || ''}</text>;
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.interfaceActions.select(this.props.edge, 'edge');
	},

	render: function() {
		const props = this.props;

		if (!props.showEdges) { return null; }

		var d = diagonal(props.edge);
		// var d = 'M'+props.edge.from.x+','+props.edge.from.y+' L'+props.edge.to.x+','+props.edge.to.y;

		return (
			<g className='edge-group'
				onClick={this._onClick}>
				<path
					className={classnames('edge', {'preview': props.preview})}
					d={d}
					stroke={(props.preview) ? props.theme.previewEdge.stroke : props.theme.edge.stroke}
					strokeWidth={props.theme.edge.strokeWidth} />
				{this.renderLabel()}
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

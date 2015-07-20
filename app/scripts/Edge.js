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
		from: React.PropTypes.object.isRequired,
		to: React.PropTypes.object.isRequired,
		theme: React.PropTypes.object.isRequired,
		preview: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			preview: false
		};
	},

	renderLabel: function() {
		var props = this.props;

		if (!props.showEdgeLabels) { return null; }

		var center = {
			x: mout.math.lerp(0.5, props.from.x, props.to.x),
			y: mout.math.lerp(0.5, props.from.y, props.to.y),
		};
		return <text
			onClick={this._onClick}
			className='label'
			x={center.x}
			y={center.y}>{props.edge.relation || ''}</text>;
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this._interfaceActions.select(this.props.edge, 'edge');
	},

	render: function() {
		var props = this.props;

		if (!props.showEdges) { return null; }

		var d = diagonal(props);
		// var d = 'M'+props.from.x+','+props.from.y+' L'+props.to.x+','+props.to.y;

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

	componentWillMount: function() {
		this._graphActions = this.props.flux.getActions('graph');
		this._interfaceActions = this.props.flux.getActions('interface');
	},

	componentDidMount: function() {
		var that = this;

		$(this.getDOMNode()).on('contextmenu', function(event) {
			let menuItems = [
				{
					label: 'delete',
					icon: icons['fa-remove'],
					action: function() { that._graphActions.removeEdge(that.props.edge); }
				}
			];
			that._interfaceActions.showContextMenu(event, that.props.group, menuItems);
			return false;
		});
	},
});


module.exports = Edge;

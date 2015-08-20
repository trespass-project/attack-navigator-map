'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var classnames = require('classnames');
var helpers = require('./helpers.js');


var GraphOutline = React.createClass({
	mixins: [PureRenderMixin],

	propTypes: {
		graph: React.PropTypes.object.isRequired
	},

	getDefaultProps: function() {
		return {};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	renderItem: function(item) {
		return (
			<li key={item.type} className='list-group-item'>
				<div className='badge' style={{ float:'right', fontWeight:'normal', marginTop:'0.15em' }}>
					{item.count}
				</div>
				<div>
					{item.type}
				</div>
			</li>
		);
	},

	render: function() {
		const props = this.props;
		const edge = props.edge;

		return (
			<ul className='list-group'>{
				['nodes', 'edges', 'groups']
					.map(function(key) {
						return {
							type: key,
							count: props.graph[key].length
						};
					})
					.map(this.renderItem)
			}</ul>
		);
	},
});


module.exports = GraphOutline;

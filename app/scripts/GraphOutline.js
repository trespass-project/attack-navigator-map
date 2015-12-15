'use strict';

let React = require('react');
let classnames = require('classnames');
let helpers = require('./helpers.js');


let GraphOutline = React.createClass({
	propTypes: {
		graph: React.PropTypes.object.isRequired,
		dispatch: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderItem: function(item) {
		const style = {
			float:'right',
			fontWeight:'normal',
			marginTop:'0.15em'
		};
		return <li key={item.type} className='list-group-item'>
			<div className='badge' style={style}>
				{item.count}
			</div>
			<div>
				{item.type}
			</div>
		</li>;
	},

	render: function() {
		const props = this.props;
		const edge = props.edge;

		return <ul className='list-group'>
			{['nodes', 'edges', 'groups']
				.map(function(key) {
					return {
						type: key,
						count: props.graph[key].length
					};
				})
				.map(this.renderItem)
			}
		</ul>;
	},
});


module.exports = GraphOutline;

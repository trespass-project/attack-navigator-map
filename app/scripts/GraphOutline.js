'use strict';

let React = require('react');


let GraphOutline = React.createClass({
	propTypes: {
		graph: React.PropTypes.object.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderItem: function(item) {
		return <li key={item.type} className='list-group-item'>
			<div className='badge'>
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

		return <ul className='list-group' id='graph-outline'>
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

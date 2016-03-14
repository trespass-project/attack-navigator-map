'use strict';

const R = require('ramda');
const React = require('react');
const classnames = require('classnames');

const Loader = require('react-loader');


const ToolChainOverlay = React.createClass({
	propTypes: {
		toolChain: React.PropTypes.object.isRequired,
		currentlyRunningToolId: React.PropTypes.number/*.isRequired*/,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderTool: function(name, index) {
		return <h3 key={name}>{name} ...</h3>;
	},

	render: function() {
		const props = this.props;
		const toolChain = props.toolChain;

		return <div id='task-overlay'>
			<div>{/* TODO: display / link to intermediate results */}
				{(!toolChain)
					? 'Tool chain not found.'
					: toolChain.tools
						.map(R.prop('name'))
						.map(this.renderTool)
				}

				{/*<Loader
					loaded={false}
					length={7}
					lines={10}
					radius={15} >
				</Loader>*/}

				<h3>
					<a href='http://lustlab.net/dev/trespass/visualizations/analytics5/' target='_blank'>
						Visualise results
					</a>
				</h3>
			</div>
		</div>;
	},
});


module.exports = ToolChainOverlay;

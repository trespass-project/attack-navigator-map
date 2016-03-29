'use strict';

const R = require('ramda');
const React = require('react');
const classnames = require('classnames');

const Loader = require('react-loader');


const ToolChainOverlay = React.createClass({
	propTypes: {
		toolChain: React.PropTypes.object.isRequired,
		taskStatusCategorized: React.PropTypes.object/*.isRequired*/,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderCompleted: function(item, index) {
		const hasResult = !!item.result_file_url;
		return <h3 className='completed' key={item.name}>
			{item.name} ✔
			{hasResult
				? <a href={item.result_file_url} className='result-link'> output︎</a>
				: null
			}
		</h3>;
	},

	renderCurrent: function(item, index) {
		const hasError = (item.status === 'error');
		return <h3 className='current' key={item.name}>
			{item.name}
			{hasError
				? <span className='error'> ⚠︎</span>
				: null
			}
		</h3>;
	},

	renderPending: function(item, index) {
		return <h3 className='pending' key={item.name}>{item.name}</h3>;
	},

	renderTools: function(taskStatusCategorized) {
		return <div>
			{taskStatusCategorized.completed.map(this.renderCompleted)}
			{taskStatusCategorized.current.map(this.renderCurrent)}
			{taskStatusCategorized.pending.map(this.renderPending)}
		</div>;
	},

	render: function() {
		const props = this.props;
		const toolChain = props.toolChain;

		const taskStatusCategorized = props.taskStatusCategorized
			|| {
				completed: [],
				current: [],
				pending: (!!toolChain) ? toolChain.tools : [],
			};

		return <div id='task-overlay'>
			<div>{/* TODO: display / link to intermediate results */}
				{(!toolChain)
					? 'Tool chain not found.'
					: this.renderTools(taskStatusCategorized)
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

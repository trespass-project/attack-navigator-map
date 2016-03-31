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
				? <a href={item.result_file_url} target='_blank' className='result-link'> output︎</a>
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
				: <Loader
					loaded={false}
					length={4}
					width={2.5}
					lines={10}
					radius={5} >
				</Loader>
			}
		</h3>;
	},

	renderPending: function(item, index) {
		return <h3 className='pending' key={item.name}>{item.name}</h3>;
	},

	renderTools: function(taskStatusCategorized) {
		return <div>
			{(taskStatusCategorized.completed || []).map(this.renderCompleted)}
			{(taskStatusCategorized.current || []).map(this.renderCurrent)}
			{(taskStatusCategorized.pending || []).map(this.renderPending)}
		</div>;
	},

	render: function() {
		const props = this.props;
		const toolChain = props.toolChain;

		const taskStatusCategorized = props.taskStatusCategorized
			|| { pending: (!!toolChain) ? toolChain.tools : [] };

		const isDone = ['pending', 'current']
			.reduce((count, collName) => {
				return count + (taskStatusCategorized[collName] || []).length;
			}, 0) === 0;

		const hasErrors = R.any(
			item => item.status === 'error',
			taskStatusCategorized.current || []
		);

		return <div id='task-overlay'>
			<div>{/* TODO: display / link to intermediate results */}
				{(!toolChain)
					? 'Tool chain not found.'
					: this.renderTools(taskStatusCategorized)
				}

				{isDone || hasErrors
					? <div>
						<hr/>
						<button
							className='btn btn-primary'
							onClick={this.onClose}
						>Close</button>
					</div>
					: null
				}
			</div>
		</div>;
	},

	onClose: function(event) {
		const props = this.props;
		if (props.onClose) {
			props.onClose();
		}
	},
});


module.exports = ToolChainOverlay;

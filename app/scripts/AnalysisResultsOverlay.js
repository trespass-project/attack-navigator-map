// const R = require('ramda');
const React = require('react');
const classnames = require('classnames');
// const Loader = require('react-loader');
const actionCreators = require('./actionCreators.js');
// const trespassVisualizations = require('trespass-visualizations');
// const { AnalysisResults } = trespassVisualizations.components;

const noop = () => {};


const ToolName = React.createClass({
	propTypes: {
		item: React.PropTypes.object.isRequired,
		pending: React.PropTypes.bool,
		completed: React.PropTypes.bool,
		selected: React.PropTypes.bool,
		onClick: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			pending: false,
			completed: false,
			selected: false,
			onClick: noop,
		};
	},

	render() {
		const { item, pending, completed, selected, onClick } = this.props;
		const hasResult = !!item.result_file_url;
		const hasError = (item.status === 'error');

		const style = {
			padding: '5px',
			marginBottom: '5px',
			border: 'solid 1px black',
			color: 'black',
			fontWeight: 'normal',
		};

		if (hasError) {
			style.background = 'rgba(255, 40, 0, 0.5)';
		}

		if (pending) {
			style.border = 'solid 1px grey';
			style.color = 'grey';
		}

		if (!pending && !completed) {
			style.color = 'red';
			// style.fontWeight = 'bold';
		}

		if (selected) {
			style.border = 'solid 1px rgb(255, 40, 0)';
		}

		return <div
			className='tool-item clearfix'
			style={style}
			onClick={() => onClick(item.name)}
		>
			<div style={{ float: 'left' }}>
				{item.name}
			</div>
			<div style={{ float: 'right' }}>
				{hasResult &&
					<a
						href={item.result_file_url}
						target='_blank'
						className='result-link'
					>output︎</a>
				}
			</div>
		</div>;
	}
});


const AnalysisResultsOverlay = React.createClass({
	propTypes: {
		toolChain: React.PropTypes.object.isRequired,
		taskStatusCategorized: React.PropTypes.object,
		analysisResults: React.PropTypes.object,
		resultsSelectedTool: React.PropTypes.string,
		onClose: React.PropTypes.func,
	},

	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onClose: () => {},
		};
	},

	onClose() {
		this.props.onClose();
	},

	onToolSelect(toolName) {
		if (!this.props.analysisResults) {
			return;
		}
		this.context.dispatch(
			actionCreators.resultsSelectTool(toolName)
		);
	},

	renderCompleted(item, index) {
		return <ToolName
			key={index}
			item={item}
			selected={this.props.resultsSelectedTool === item.name}
			onClick={this.onToolSelect}
			completed
		/>;
	},

	renderCurrent(item, index) {
		return <ToolName
			key={index}
			item={item}
			selected={this.props.resultsSelectedTool === item.name}
			onClick={this.onToolSelect}
		/>;
	},

	renderPending(item, index) {
		return <ToolName
			key={index}
			item={item}
			selected={this.props.resultsSelectedTool === item.name}
			onClick={this.onToolSelect}
			pending
		/>;
	},

	renderTools(taskStatusCategorized) {
		return <div>
			{(taskStatusCategorized.completed || [])
				.map(this.renderCompleted)}
			{(taskStatusCategorized.current || [])
				.map(this.renderCurrent)}
			{(taskStatusCategorized.pending || [])
				.map(this.renderPending)}
		</div>;
	},

	render() {
		const props = this.props;
		const toolChain = props.toolChain;

		const taskStatusCategorized = props.taskStatusCategorized
			|| {
				pending: (!!toolChain)
					? toolChain.tools
					: []
			};

		// const isDone = ['pending', 'current']
		// 	.reduce((count, collName) => {
		// 		return count + (taskStatusCategorized[collName] || []).length;
		// 	}, 0) === 0;

		// const hasErrors = R.any(
		// 	item => item.status === 'error',
		// 	taskStatusCategorized.current || []
		// );

		const resultsReady = !!props.analysisResults;

		const closeX = <div
			className='close-x'
			onClick={this.onClose}
		>×</div>;

		return <div id='AnalysisDashboard'>
			<div className='visualization'>
				<div>visualization</div>
				<div>attacker profit: {props.attackerProfit}</div>
				{/*<AttacktreeVisualization
					attacktree={state.attacktree}
					layout={undefined}
				/>*/}
			</div>

			<div className={classnames('tools', { ready: resultsReady })}>
				<div className='clearfix' style={{ marginBottom: 5 }}>
					<div style={{ float: 'left', color: 'grey' }}>
						Tools
					</div>
					<div style={{ float: 'right' }}>
						{closeX}
					</div>
				</div>

				{(!toolChain)
					? <div>'Tool chain not found.'</div>
					: this.renderTools(taskStatusCategorized)
				}

				<hr />
			</div>

			{/*<div>
				{resultsReady
					? <div >
						<hr />
						<AnalyticsComponent
							ataInput={props.analysisResults['A.T. Analyzer']}
							ateInput={props.analysisResults['A.T. Evaluator'][0]}
						/>
						{<AnalysisResults
							parsedATAResults={props.ataAttacktrees}
							parsedATEResults={props.ateData}
							aplAttacktree={props.aplAttacktree}
							utility={20000}
						/>}
					</div>
					: null
				}
			</div>*/}
		</div>;
	},
});


module.exports = AnalysisResultsOverlay;

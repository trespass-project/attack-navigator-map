const React = require('react');
const classnames = require('classnames');
const R = require('ramda');
const Loader = require('react-loader');
const actionCreators = require('./actionCreators.js');
const attacktreeVisPresets = require('./attacktreeVisPresets.js');
const trespassVisualizations = require('trespass-visualizations');
const { ATAnalyzerResults, ATEvaluatorResults, AttacktreeVisualization } = trespassVisualizations.components;

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
		const isRunning = (!pending && !completed);

		const style = {
			border: 'solid 1px black',
			color: 'black',
		};

		if (hasError) {
			style.background = 'rgba(255, 40, 0, 0.5)';
		}

		if (pending) {
			style.border = 'solid 1px grey';
			style.color = 'grey';
		}

		if (isRunning) {
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
				<span>{item.name} </span>
				{(isRunning) &&
					<Loader
						loaded={false}
						length={4}
						width={2}
						lines={10}
						radius={4}
					/>
				}
			</div>
			<div style={{ float: 'right' }}>
				{hasResult &&
					<a
						href={item.result_file_url}
						target='_blank'
						className='result-link'
					>output︎ file</a>
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
		resultsSelectedAttackIndex: React.PropTypes.number,
		resultsAttacktree: React.PropTypes.object,
		analysisSnapshots: React.PropTypes.array.isRequired,
		onClose: React.PropTypes.func,
		highlightNodeIds: React.PropTypes.array,
	},

	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onClose: () => {},
			analysisSnapshots: [],
			highlightNodeIds: [],
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

	onAttackSelect(item, index) {
		this.context.dispatch(
			actionCreators.resultsSelectAttack(index)
		);
	},

	onAttackHover(item, index) {
		const { props } = this;
		if (index === props.resultsSelectedAttackIndex) {
			return;
		}
		this.context.dispatch(
			actionCreators.highlightAttackTreeNodes(index)
		);
	},

	onAttackHoverOut() {
		const { props } = this;
		this.onAttackSelect(undefined, props.resultsSelectedAttackIndex);
	},

	selectToolchainRun(event) {
		const snapshotIndex = event.target.value;
		const snapshot = this.props.analysisSnapshots[snapshotIndex];
		this.context.dispatch(
			actionCreators.selectAnalysisResultsSnapshot(snapshot)
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
		const { props, context } = this;
		const toolChain = props.toolChain;

		const taskStatusCategorized = props.taskStatusCategorized
			|| {
				pending: (!!toolChain)
					? toolChain.tools
					: []
			};

		const closeX = <div
			className='close-x'
			onClick={this.onClose}
		>×</div>;

		const resultsReady = !!props.analysisResults;

		const k = `${props.resultsSelectedTool}-${props.resultsSelectedAttackIndex}`;

		const attacktreeProps = attacktreeVisPresets['normal'];

		let ToolVisualization = null;
		if (props.resultsSelectedTool) {
			/* eslint default-case: 0 */
			switch (props.resultsSelectedTool) {
				case 'A.T. Analyzer': {
					ToolVisualization = <ATAnalyzerResults
						attacktrees={props.analysisResults['A.T. Analyzer']}
						selectedIndex={props.resultsSelectedAttackIndex}
						onSelect={this.onAttackSelect}
						onHover={this.onAttackHover}
						onHoverOut={this.onAttackHoverOut}
					/>;
					break;
				}

				case 'A.T. Evaluator': {
					ToolVisualization = <ATEvaluatorResults
						width={0}
						height={400}
						data={props.analysisResults['A.T. Evaluator']}
						profit={props.attackerProfit}
						selectedIndex={props.resultsSelectedAttackIndex}
						onSelect={this.onAttackSelect}
						onHover={this.onAttackHover}
						onHoverOut={this.onAttackHoverOut}
					/>;
					break;
				}
			}
		}

		return <div id='AnalysisDashboard'>
			<div className='visualization'>
				<AttacktreeVisualization
					key={k}
					attacktree={props.resultsAttacktree}
					{...attacktreeProps}
				/>
			</div>

			<div className={classnames('tools', { ready: resultsReady })}>
				<div className='clearfix'>
					<div style={{ float: 'left' }}>
						<span style={{ color: 'grey' }}>Toolchain run: </span>
						<select
							name='snapshots'
							style={{
								visibility: (!resultsReady)
									? 'hidden'
									: 'visible',
							}}
							onChange={this.selectToolchainRun}
						>
							{props.analysisSnapshots
								.map((snapshot, index) => {
									return <option
										key={index}
										value={index}
									>
										{snapshot.formattedToolchainRunDate}
									</option>;
								})
							}
						</select>
					</div>

					<div style={{ float: 'right' }}>
						{closeX}
					</div>
				</div>

				<hr />

				{/* TODO: outsource css */}
				<div style={{ marginBottom: 5 }}>
					<div style={{ color: 'grey' }}>
						Tools
					</div>
				</div>

				{(!toolChain)
					? <div>'Tool chain not found.'</div>
					: this.renderTools(taskStatusCategorized)
				}

				<hr />

				{ToolVisualization}
			</div>
		</div>;
	},
});


module.exports = AnalysisResultsOverlay;

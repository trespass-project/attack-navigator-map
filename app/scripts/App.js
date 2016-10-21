const React = require('react');
import { ActionCreators as UndoActionCreators } from 'redux-undo';
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json').toString());
const R = require('ramda');
const $ = require('jquery');
const classnames = require('classnames');
const constants = require('./constants.js');
const actionCreators = require('./actionCreators.js');
const Wizard = require('./Wizard.js');
const GraphEditor = require('./GraphEditor.js');
const AnalysisResultsOverlay = require('./AnalysisResultsOverlay.js');


const introHighlight = R.curry(
	(selector, event) => {
		const $marker = $('body').find('#marker');
		if (!selector) {
			$marker.css({
				display: 'none'
			});
			return;
		}

		const $target = $('body').find(selector);
		const offset = $target.offset();

		// const padding = 5;
		// $marker.css({
		// 	left: offset.left - padding,
		// 	top: offset.top - padding,
		// 	width: $target.outerWidth() + (2 * padding),
		// 	height: $target.outerHeight() + (2 * padding),
		// 	display: 'block',
		// });

		const size = 30;
		const centerX = offset.left - 5;
		const centerY = offset.top - 5;
		$marker.css({
			left: centerX,
			top: centerY,
			width: size,
			height: size,
			borderRadius: size / 2,
			border: 'none',
			background: 'rgba(255, 40, 0, 0.75)',
			display: 'block',
		});
	}
);


const App = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
	},

	childContextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	getChildContext() {
		const props = this.props;
		return {
			theme: props.theme,
			dispatch: props.dispatch,
		};
	},

	componentDidMount() {
		const props = this.props;

		props.dispatch( actionCreators.getRecentFiles() );

		const editorElem = document.querySelector('#editor > svg');
		props.dispatch( actionCreators.setEditorElem(editorElem) );

		window.addEventListener('beforeunload', this.handleBeforeUnload);
		window.addEventListener('keydown', this.keyHandler);
	},

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
		window.removeEventListener('keydown', this.keyHandler);
	},

	handleBeforeUnload(event) {
		// save last state of map / model
		this.saveMap(event);

		// this whole message thing doesn't seem to work (anymore),
		// but let's still interrupt here.
		// const msg = 'Are you sure?\nChanges you made may not be saved.';
		// event.returnValue = msg;
		// return msg;
	},

	keyHandler(event) {
		const ctrlOrCmd = (event.ctrlKey || event.metaKey);
		const shift = !!event.shiftKey;

		if (ctrlOrCmd && event.keyCode === 83) {
			// [control / command] + [s]
			this.saveMap(event);
		} else if (shift && ctrlOrCmd && event.keyCode === 90) {
			// [shift] + [control / command] + [z]
			event.preventDefault();
			this.props.dispatch( UndoActionCreators.redo() );
		} else if (ctrlOrCmd && event.keyCode === 90) {
			// [control / command] + [z]
			event.preventDefault();
			this.props.dispatch( UndoActionCreators.undo() );
		}
	},

	saveMap(event) {
		if (event) { event.preventDefault(); }
		const modelId = this.props.metadata.id;
		this.props.dispatch(
			actionCreators.saveModelToKb(modelId)
		);
	},

	saveDialogOnClose() {
		this.props.dispatch( actionCreators.showSaveDialog(false) );
	},

	handleLayerChange(layer, isChecked) {
		this.props.dispatch(
			actionCreators.enableLayer(layer.name, isChecked)
		);
	},

	render() {
		const props = this.props;

		const classNames = classnames(
			{ 'open': props.hasOpenMap }
		);

		return (
			<div id='container' className={classNames}>
				<input type='file' accept='.svg' id='add-file' />

				{(props.hasOpenMap)
					? <div id='layersControl'>
						<strong>Layers</strong>
						{props.displayLayersList
							.map((layer) => {
								return <div key={layer.name}>
									<label style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
										<input
											type='checkbox'
											checked={!!props.activeLayers[layer.name]}
											onChange={(event) => this.handleLayerChange(layer, event.target.checked)}
										/> {layer.displayName}
									</label>
								</div>;
							})
						}
					</div>
					: null
				}

				{(props.resultsAttacktree) &&
					<div id='heatmapControl'>
						{(props.showAnalysisOverlay)
							? <a
								onClick={(event) => {
									event.preventDefault();
									props.dispatch(
										actionCreators.enableLayer('HeatmapLayer', true)
									);
									props.dispatch(
										actionCreators.showAnalysisOverlay(false)
									);
								}}
								href='#'
							>highlight components on map</a>
							: <a
								href='#'
								onClick={(event) => {
									event.preventDefault();
									props.dispatch(
										actionCreators.showAnalysisOverlay(true)
									);
									props.dispatch(
										actionCreators.enableLayer('HeatmapLayer', false)
									);
								}}
							>back to analysis results</a>
						}
					</div>
				}

				<div id='meta'>
					<span>ANM {pkg.version}</span>
					{(props.hasOpenMap)
						? <span> · <a href={constants.manualUrl} target='_blank'>manual</a> · <a href={constants.issueTrackerUrl} target='_blank'>issue tracker</a></span>
						: null
					}
				</div>

				<div id='map-container'>
					{(!props.hasOpenMap)
						? <div id='introduction'>
							<div id='intro-box'>
								<div
									id='marker'
									style={{
										position: 'absolute',
										display: 'none',
										border: 'solid 3px rgb(255, 30, 0)'
									}}
								/>

								<div>
									<h3 style={{ marginTop: 0 }}>Attack Navigator Map</h3>
								</div>

								<div>
									Get started by:
									<ul>
										<li>
											<a
												href='#'
												onClick={(event) => this.refs.wizard.clickCreateNew(event)}
												onMouseEnter={introHighlight('#create-new-map')}
												onMouseLeave={introHighlight(null)}
											>creating a new map</a>
										</li>
										<li>
											<a
												href='#'
												onClick={(event) => this.refs.wizard.clickFileButton(event)}
												onMouseEnter={introHighlight('#import-model-file')}
												onMouseLeave={introHighlight(null)}
											>loading a model file</a>
										</li>
										<li>
											<a
												onMouseEnter={introHighlight('#recent-models')}
												onMouseLeave={introHighlight(null)}
											>opening an existing map</a>
										</li>
									</ul>
								</div>

								<hr />

								<div>
									<a href={constants.manualUrl} target='_blank'>Read the full manual</a><sup> ↗︎</sup>
								</div>

								<div>
									<a href={constants.issueTrackerUrl} target='_blank'>Report an issue</a><sup> ↗︎</sup>
								</div>
							</div>
						</div>
						: null
					}

					<div id='map'>
						<GraphEditor
							id='editor'
							hasOpenMap={props.hasOpenMap}
							{...props}
						/>
					</div>
				</div>

				<div id='panel-container'>
					<Wizard
						ref='wizard'
						{...props}
						saveMap={this.saveMap}
					/>
				</div>

				{(props.showAnalysisOverlay) &&
					<AnalysisResultsOverlay
						attackerProfit={props.attackerProfit}
						toolChain={props.toolChains[props.toolChainId]}
						taskStatusCategorized={props.taskStatusCategorized}
						analysisResults={props.analysisResults}
						analysisSnapshots={props.analysisSnapshots}
						resultsAttacktree={props.resultsAttacktree}
						resultsSelectedTool={props.resultsSelectedTool}
						resultsSelectedAttackIndex={props.resultsSelectedAttackIndex}
						onClose={() => {
							props.dispatch(
								actionCreators.showAnalysisOverlay(false)
							);
						}}
						highlightNodeIds={props.highlightNodeIds}
						selectedAttacktreePreset={props.selectedAttacktreePreset}
						selectedAttacktreeLayout={props.selectedAttacktreeLayout}
						resultsAttacktreeLabelsHistogram={props.resultsAttacktreeLabelsHistogram}
						labelToNodeIdsMap={props.labelToNodeIdsMap}
					/>
				}
			</div>
		);
	}
});

module.exports = App;

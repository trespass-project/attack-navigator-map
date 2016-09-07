const React = require('react');
const R = require('ramda');
const _ = require('lodash');

const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

const constants = require('./constants.js');
const actionCreators = require('./actionCreators.js');
const knowledgebaseApi = require('trespass.js').api.knowledgebase;

// const ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
// const MainMenu = require('./MainMenu.js');
const Wizard = require('./Wizard.js');
const GraphEditor = require('./GraphEditor.js');
const AnalysisResultsOverlay = require('./AnalysisResultsOverlay.js');


const notEmpty = R.complement(_.isEmpty);


module.exports =
React.createClass({
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
		window.addEventListener('keydown', this.saveHandler);
	},

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
		window.removeEventListener('keydown', this.saveHandler);
	},

	handleBeforeUnload(event) {
		// save last state of map / model
		this.save(event);

		// this whole message thing doesn't seem to work (anymore),
		// but let's still interrupt here.
		// const msg = 'Are you sure?\nChanges you made may not be saved.';
		// event.returnValue = msg;
		// return msg;
	},

	saveHandler(event) {
		// if control or command key is pressed and the s key is pressed
		if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) {
			event.preventDefault();
			this.save();
		}
	},

	save(event) {
		if (event) {
			event.preventDefault();
		}
		const modelId = this.props.metadata.id;
		this.props.dispatch( actionCreators.saveModelToKb(modelId) );
	},

	renameMap() {
		let newName = prompt('Enter new name');
		if (!newName) { return; }
		newName = newName.trim();
		if (!newName) { return; }
		const modelId = this.props.metadata.id;
		this.props.dispatch( actionCreators.renameMap(modelId, newName) );
	},

	deleteModel(event) {
		if (event) {
			event.preventDefault();
		}
		const modelId = this.props.metadata.id;
		this.props.dispatch( actionCreators.deleteModel(modelId) );
	},

	fetchKbData(event) {
		event.preventDefault();
		const modelId = this.props.metadata.id;
		this.props.dispatch( actionCreators.fetchKbData(modelId) );
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
		const modelId = props.metadata.id;

		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				{(props.hasOpenMap)
					? <div id='layersControl'>
						{props.availableLayersList
							.filter((item) => notEmpty(item.displayName))
							.map((layer) => {
								return <div key={layer.name}>
									<input
										type='checkbox'
										checked={!!props.activeLayers[layer.name]}
										onChange={(event) => this.handleLayerChange(layer, event.target.checked)}
									/> {layer.displayName}
								</div>;
							})
						}
					</div>
					: null
				}

				{(props.resultsAttacktree) &&
					<div id='heatmapControl'>
						{(props.analysisRunning)
							? <a
								onClick={(event) => {
									event.preventDefault();
									props.dispatch(
										actionCreators.enableLayer('HeatmapLayer', true)
									);
									props.dispatch(
										actionCreators.setAnalysisRunning(false)
									);
								}}
								href='#'
							>highlight components on map</a>
							: <a
								href='#'
								onClick={(event) => {
									event.preventDefault();
									props.dispatch(
										actionCreators.setAnalysisRunning(true)
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
					{(props.hasOpenMap)
						? <div>
							<div>model id: {modelId}</div>
							<div>
								<span>title: {props.metadata.title} </span>
								<a href='#' onClick={this.renameMap}>edit</a>
							</div>
						</div>
						: ''
					}

					{(props.hasOpenMap)
						? <div>
							<a
								href={`${knowledgebaseApi.host}tkb/files/edit?model_id=${modelId}`}
								target='_blank'
							>
								edit knowledgebase files
							</a>

							<br />

							<a
								href='#'
								onClick={this.fetchKbData}
							>re-fetch knowledgebase data</a>

							<br />

							<a
								href={`${knowledgebaseApi.host}tkb/files/zip?model_id=${modelId}`}
								target='_blank'
							>download knowledgebase files</a>

							<br />

							<a
								href='#'
								onClick={this.save}
							>save map</a>

							<br />

							<a
								href='#'
								onClick={this.deleteModel}
							>delete map</a>
						</div>
						: ''
					}

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
								<div>
									<strong>Attack Navigator Map</strong>
								</div>

								<div>
									Start by
									<ul>
										<li>creating a new map</li>
										<li>loading a model file</li>
										<li>opening an existing map</li>
									</ul>
								</div>

								<div>
									<a href={constants.manualUrl} target='_blank'>Read the manual</a>
								</div>

								<div>
									<a href={constants.issueTrackerUrl} target='_blank'>Report an issue</a>
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

				{/*<div id='model-debug-view'>
					<div className='panel-section'>
						<h3 className='title'>debug</h3>
						<MainMenu id='main-menu' {...props} />
					</div>
					<div className='panel-section'>
						<h3 className='title'>model</h3>
						<ModelDebugView {...props} />
					</div>
				</div>*/}

				<div id='panel-container'>
					<Wizard hasOpenMap={props.hasOpenMap} {...props} />
				</div>

				{(props.analysisRunning) &&
					<AnalysisResultsOverlay
						attackerProfit={props.attackerProfit}
						toolChain={props.toolChains[props.toolChainId]}
						taskStatusCategorized={props.taskStatusCategorized}
						analysisResults={props.analysisResults}
						resultsAttacktree={props.resultsAttacktree}
						resultsSelectedTool={props.resultsSelectedTool}
						resultsSelectedAttackIndex={props.resultsSelectedAttackIndex}
						onClose={() => {
							props.dispatch(
								actionCreators.setAnalysisRunning(false)
							);
						}}
					/>
				}
			</div>
		);
	}
});

const React = require('react');

const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

const actionCreators = require('./actionCreators.js');
const knowledgebaseApi = require('trespass.js').api.knowledgebase;

// const ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
// const MainMenu = require('./MainMenu.js');
const Wizard = require('./Wizard.js');
const UsageHint = require('./UsageHint.js');
const GraphEditor = require('./GraphEditor.js');


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
		// this whole message thing doesn't seem to work (anymore),
		// but let's still interrupt here.
		const msg = 'Are you sure?\nChanges you made may not be saved.';
		event.returnValue = msg;
		return msg;
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
		this.props.dispatch( actionCreators.saveModelToKb() );
	},

	deleteModel(event) {
		if (event) {
			event.preventDefault();
		}
		this.props.dispatch( actionCreators.deleteModel() );
	},

	fetchKbData(event) {
		event.preventDefault();
		this.props.dispatch( actionCreators.fetchKbData() );
	},

	saveDialogOnClose() {
		this.props.dispatch( actionCreators.showSaveDialog(false) );
	},

	render() {
		const props = this.props;
		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				<div id='meta'>
					{(props.metadata.id)
						? <div>
							<div>model id: {props.metadata.id}</div>
							<div>title: {props.metadata.title}</div>
						</div>
						: ''
					}

					{(props.metadata.id)
						? <div>
							<a
								href={`${knowledgebaseApi.host}tkb/files/edit?model_id=${props.metadata.id}`}
								target='_blank'
							>
								edit knowledgebase files
							</a>
							<br />
							<a
								href='#'
								onClick={this.fetchKbData}
							>
								re-fetch knowledgebase data
							</a>

							<UsageHint>
								<a
									href='#'
									onClick={this.save}
								>
									save map
								</a>
							</UsageHint>

							<a
								href='#'
								onClick={this.deleteModel}
							>
								delete map
							</a>
						</div>
						: ''
					}

					<hr style={{ marginTop: 5, marginBottom: 5 }} />
					ANM {pkg.version}<br />
					<UsageHint>
						<a
							target='_blank'
							href='https://docs.google.com/document/d/1Qp8nJgdvDespq1Q5zQcAT1SSTKK23m2XKMUKKmoKYQU/edit?usp=sharing'
						>
							manual
						</a>
					</UsageHint>

					<UsageHint>
						<a
							href='https://gitlab.com/freder/anm-feedback/issues'
							target='_blank'
						>
							report bug / give feedback
						</a>
					</UsageHint>
				</div>

				<div id='map-container'>
					<div id='map'>
						<GraphEditor id='editor' {...props} />
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
					<Wizard {...props} />
				</div>
			</div>
		);
	}
});

'use strict';

let $ = require('jquery');
let R = require('ramda');
let React = require('react');
let classnames = require('classnames');
const actionCreators = require('./actionCreators.js');

let GraphMinimap = require('./Graph.js').GraphMinimap;
let PropertiesPanel = require('./PropertiesPanel.js');
let Library = require('./components/Library/Library.js');

const api = require('../../api.js').api;
const serverPort = require('../../api.js').serverPort;
const serverDomain = require('../../api.js').serverDomain;
function apiUrl(url) {
	return 'http://' + serverDomain + ':' + serverPort + url;
}


function handleAdd() {
	console.log('here');
}


let Wizard = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	renderMinimap: function(props) {
		return <GraphMinimap id='minimap' />;
	},

	renderProperties: function(props) {
		return <PropertiesPanel
			relationsLibUrl={apiUrl(api.relations.url)}
			id='propspanel' />;
	},

	renderImport: function(props) {
		return <div>
			<input
				ref='load-model'
				type='file'
				accept='.xml'
				onChange={this.loadXMLFile} />
		</div>;
	},

	renderLocations: function(props) {
		const filterFn = function(a) {
			return R.contains(a.type, ['location']);
		};
		return <div>
			<div id='pattern-lib'>
				<Library
					key={'locations-patterns'}
					url={apiUrl(api.patterns.url)}
					title='patterns' />
			</div>
			<div id='component-lib'>
				<Library
					key={'locations-components'}
					url={apiUrl(api.components.url)}
					title='components'
					filter={filterFn}
					onAdd={handleAdd} />
			</div>
		</div>;
	},

	renderAssets: function(props) {
		const filterFn = function(a) {
			return R.contains(a.type, ['asset/item', 'asset/data']);
		};
		return <div>
			<div id='component-lib'>
				<Library
					key={'assets-components'}
					url={apiUrl(api.components.url)}
					title='components'
					filter={filterFn}
					onAdd={handleAdd} />
			</div>
		</div>;
	},

	renderActors: function(props) {
		const filterFn = function(a) {
			return R.contains(a.type, ['actor', 'role']);
		};
		return <div>
			<div id='pattern-lib'>
				<Library
					key={'actors-patterns'}
					url={apiUrl(api.patterns.url)}
					title='patterns' />
			</div>
			<div id='component-lib'>
				<Library
					key={'actors-components'}
					url={apiUrl(api.components.url)}
					title='components'
					filter={filterFn}
					onAdd={handleAdd} />
			</div>
		</div>;
	},

	renderPolicies: function(props) {
		return <div>policies</div>;
	},

	renderAttackerProfile: function(props) {
		return <div>attacker profile</div>;
	},

	render: function() {
		const props = this.props;
		const wizard = props.wizard;
		const selectedSection = wizard.selectedSection;

		const wizardSteps = {
			'import': {
				renderFn: this.renderImport,
			},
			'locations': {
				renderFn: this.renderLocations,
			},
			'assets': {
				renderFn: this.renderAssets,
			},
			'actors': {
				renderFn: this.renderActors,
			},
			'policies': {
				renderFn: this.renderPolicies,
			},
			'attacker profile': {
				renderFn: this.renderAttackerProfile,
			},
		};

		let defaultRenderFn = function() {
			return <div>error</div>;
		};
		let renderFn = (!!wizardSteps[wizard.selectedSection])
			? wizardSteps[wizard.selectedSection].renderFn
				|| defaultRenderFn
			: defaultRenderFn;

		// TODO: activate minimap
		return (
			<div>
				{/*{this.renderMinimap(props)}*/}
				{this.renderProperties(props)}

				<div id='wizard-container'>
					<div id='steps-container'>
						<div
							className={classnames('step-icon',
								{ selected: (selectedSection === 'import') })
							}
							onClick={R.partial(this.selectWizardStep, ['import'])} >
							import
						</div>
						<div
							className={classnames('step-icon',
								{ selected: (selectedSection === 'locations') })
							}
							onClick={R.partial(this.selectWizardStep, ['locations'])} >
							locations
						</div>
						<div
							className={classnames('step-icon',
								{ selected: (selectedSection === 'assets') })
							}
							onClick={R.partial(this.selectWizardStep, ['assets'])} >
							assets
						</div>
						<div
							className={classnames('step-icon',
								{ selected: (selectedSection === 'actors') })
							}
							onClick={R.partial(this.selectWizardStep, ['actors'])} >
							actors
						</div>
						<div
							className={classnames('step-icon',
								{ selected: (selectedSection === 'policies') })
							}
							onClick={R.partial(this.selectWizardStep, ['policies'])} >
							policies
						</div>
						<div
							className={classnames('step-icon',
								{ selected: (selectedSection === 'attacker profile') })
							}
							onClick={R.partial(this.selectWizardStep, ['attacker profile'])} >
							attacker profile
						</div>
					</div>

					{renderFn(props)}
				</div>
			</div>
		);
	},

	loadXMLFile: function(event) {
		event.preventDefault();
		let $fileInput = $(this.refs['load-model'].getDOMNode());
		let file = $fileInput[0].files[0];
		this.props.dispatch( actionCreators.loadXMLFile(file) );
	},

	selectWizardStep(name, event) {
		event.preventDefault();
		this.props.dispatch( actionCreators.selectWizardStep(name) );
	}

});


module.exports = Wizard;

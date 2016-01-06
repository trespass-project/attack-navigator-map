'use strict';

let $ = require('jquery');
let R = require('ramda');
let React = require('react');
let classnames = require('classnames');
const actionCreators = require('./actionCreators.js');

let GraphMinimap = require('./Graph.js').GraphMinimap;
let PropertiesPanel = require('./PropertiesPanel.js');
let Library = require('./components/Library/Library.js');

let OverlayTrigger = require('react-bootstrap').OverlayTrigger;
let Tooltip = require('react-bootstrap').Tooltip;

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

	renderMinimap: function(props) {
		return <GraphMinimap id='minimap' />;
	},

	renderProperties: function(props) {
		return <PropertiesPanel
			id='propspanel'
			selected={props.selected}
			graph={props.graph}
			dispatch={props.dispatch}
			relationsLibUrl={apiUrl(api.relations.url)}
		/>;
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
				<Library {...props}
					key={'locations-patterns'}
					url={apiUrl(api.patterns.url)}
					title='patterns' />
			</div>
			<div id='component-lib'>
				<Library {...props}
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
				<Library {...props}
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
				<Library {...props}
					key={'actors-patterns'}
					url={apiUrl(api.patterns.url)}
					title='patterns' />
			</div>
			<div id='component-lib'>
				<Library {...props}
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
						<OverlayTrigger placement='left' overlay={<Tooltip id="import">Import model</Tooltip>}>
							<div
								className={classnames('step-icon',
									{ selected: (selectedSection === 'import') })
								}
								onClick={R.partial(this.selectWizardStep, ['import'])} >
								<img src='images/icons/import-01.svg' />
							</div>
						</OverlayTrigger>
						<OverlayTrigger placement='left' overlay={<Tooltip id="locations">Locations</Tooltip>}>
							<div
								className={classnames('step-icon',
									{ selected: (selectedSection === 'locations') })
								}
								onClick={R.partial(this.selectWizardStep, ['locations'])} >
								<img src='images/icons/Location-01.svg' />
							</div>
						</OverlayTrigger>
						<OverlayTrigger placement='left' overlay={<Tooltip id="assets">Assets</Tooltip>}>
							<div
								className={classnames('step-icon',
									{ selected: (selectedSection === 'assets') })
								}
								onClick={R.partial(this.selectWizardStep, ['assets'])} >
								<img src='images/icons/Assets-01.svg' />
							</div>
						</OverlayTrigger>
						<OverlayTrigger placement='left' overlay={<Tooltip id="actors">Actors</Tooltip>}>
							<div
								className={classnames('step-icon',
									{ selected: (selectedSection === 'actors') })
								}
								onClick={R.partial(this.selectWizardStep, ['actors'])} >
								<img src='images/icons/Actors-01.svg' />
							</div>
						</OverlayTrigger>
						<OverlayTrigger placement='left' overlay={<Tooltip id="policies">Policies</Tooltip>}>
							<div
								className={classnames('step-icon',
									{ selected: (selectedSection === 'policies') })
								}
								onClick={R.partial(this.selectWizardStep, ['policies'])} >
								<img src='images/icons/policies-01.svg' />
							</div>
						</OverlayTrigger>
						<OverlayTrigger placement='left' overlay={<Tooltip id="attackerprofile">Attacker profile</Tooltip>}>
							<div
								className={classnames('step-icon',
									{ selected: (selectedSection === 'attacker profile') })
								}
								onClick={R.partial(this.selectWizardStep, ['attacker profile'])} >
								<img src='images/icons/attacker_profile-01.svg' />
							</div>
						</OverlayTrigger>
					</div>

					{renderFn(props)}
				</div>
			</div>
		);
	},

	loadXMLFile: function(event) {
		event.preventDefault();
		let $fileInput = $(this.refs['load-model']);
		let file = $fileInput[0].files[0];
		this.props.dispatch( actionCreators.loadXMLFile(file) );
	},

	selectWizardStep(name, event) {
		event.preventDefault();
		this.props.dispatch( actionCreators.selectWizardStep(name) );
	}

});


module.exports = Wizard;

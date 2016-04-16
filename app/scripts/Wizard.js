'use strict';

const $ = require('jquery');
const R = require('ramda');
const React = require('react');
const classnames = require('classnames');
const actionCreators = require('./actionCreators.js');
const helpers = require('./helpers.js');

const GraphMinimap = require('./GraphMinimap.js');
const PropertiesPanel = require('./PropertiesPanel.js');
const GraphOutline = require('./GraphOutline.js');
const Library = require('./components/Library/Library.js');

const OverlayTrigger = require('react-bootstrap').OverlayTrigger;
const Tooltip = require('react-bootstrap').Tooltip;

import JSONTree from 'react-json-tree';

const ToolChainOverlay = require('./ToolChainOverlay.js');
const PredicateEditor = require('./PredicateEditor.js');
const AttackerProfileEditor = require('./AttackerProfileEditor/AttackerProfileEditorLanguage.js');

const predicatesLib = helpers.normalize(require('../data/predicate-lib.json')).items;


const theme = {
	scheme: 'asdf',
	author: 'asdf',
	base00: '#000000',
	base01: '#000000',
	base02: '#000000',
	base03: '#000000',
	base04: '#000000',
	base05: '#000000',
	base06: '#000000',
	base07: '#000000',
	base08: '#000000',
	base09: '#000000',
	base0A: '#000000',
	base0B: '#000000',
	base0C: '#000000',
	base0D: '#000000',
	base0E: '#000000',
	base0F: '#000000'
};


function handleAdd() {
	console.log('here');
}


function componentTypesFilter(types) {
	return (item) => {
		return R.contains(item.modelComponentType, types);
	};
}


const Tab = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired,
		selectedSection: React.PropTypes.string.isRequired,
		icon: React.PropTypes.string.isRequired,
		tooltip: React.PropTypes.string.isRequired,
		handleClick: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	render: function() {
		const props = this.props;
		const isSelected = (props.selectedSection === props.name);
		// const imgSrc = (isSelected)
		// 	? props.icon.replace('.svg', '-inverted.svg')
		// 	: props.icon;
		const imgSrc = props.icon;

		return <OverlayTrigger
			placement='left'
			overlay={<Tooltip id={props.name}>{props.tooltip}</Tooltip>}>
			<div
				className={classnames('step-icon',
					{ selected: isSelected })
				}
				onClick={props.handleClick} >
				<img src={imgSrc} />
			</div>
		</OverlayTrigger>;
	},
});


const Wizard = React.createClass({
	contextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderMinimap: function(props) {
		return <GraphMinimap
			id='minimap'
			graph={props.graph}
			theme={this.context.theme}
			showEdges={true}
		/>;
	},

	renderOutline: function(props) {
		return null; // TODO: implement some sort of debug view
		// return <div>
		// 	<h3 className='title'>outline</h3>
		// 	<GraphOutline graph={props.graph} />
		// </div>;
	},

	renderProperties: function(props) {
		return <PropertiesPanel
			id='propspanel'
			key={`propspanel-${((props.selectedId)
				? props.selectedId
				: '')}`}
			selectedId={props.selectedId}
			selectedType={props.selectedType}
			graph={props.graph}
			relationTypes={props.relationTypes}
			componentsLib={props.componentsLib}
			kbTypeAttributes={props.kbTypeAttributes}
			modelComponentTypeToKbTypes={props.modelComponentTypeToKbTypes}
		/>;
	},

	renderImport: function() {
		const props = this.props;

		return <div>
			<h2 className='title'>Import</h2>
			<input
				style={{ display: 'none' }}
				ref='load-model'
				type='file'
				accept='.xml'
				onChange={this.loadXMLFile} />

			<button
				onClick={this.clickFileButton}
				className='btn btn-default btn-xs'>
				Load model XML file
			</button>

			<br/>
			<br/>
			<div className='pattern-lib'>
				<Library
					items={props.modelPatterns}
					key={'locations-patterns'}
					title='patterns' />
			</div>
		</div>;
	},

	renderLocations: function(props) {
		const items = props.componentsLib.filter(componentTypesFilter(['location']));
		return <div>
			<h2 className='title'>Locations</h2>

			<div className='component-lib'>
				<Library
					key={'locations-components'}
					items={items}
					title='components' />
			</div>
		</div>;
	},

	renderAssets: function(props) {
		const items = props.componentsLib.filter(componentTypesFilter(['item', 'data']));
		return <div>
			<h2 className='title'>Assets</h2>
			<div className='component-lib'>
				<Library
					key={'assets-components'}
					items={items}
					title='components' />
			</div>
		</div>;
	},

	renderActors: function(props) {
		const items = props.componentsLib.filter(componentTypesFilter(['actor']));
		return <div>
			<h2 className='title'>Actors</h2>
			{/*<div className='pattern-lib'>
				<Library
					key={'actors-patterns'}
					title='patterns' />
			</div>*/}
			<div className='component-lib'>
				<Library
					key={'actors-components'}
					items={items}
					title='components' />
			</div>
		</div>;
	},

	renderConnections: function() {
		const props = this.props;
		const predicates = R.values(props.graph.predicates || {});
		return <div>
			<h2 className='title'>Connections</h2>
			<PredicateEditor
				nodes={props.graph.nodes}
				predicatesLib={props.predicatesLib || predicatesLib}
				predicates={predicates}
				handleCreate={this.createPredicate}
				handleUpdate={this.updatePredicate}
			/>
		</div>;
	},

	createPredicate: function(predicate) {
		this.context.dispatch(
			actionCreators.addPredicate(predicate)
		);
	},

	updatePredicate: function(predicateId, newProperties) {
		this.context.dispatch(
			actionCreators.predicateChanged(predicateId, newProperties)
		);
	},

	renderPolicies: function() {
		const policies = R.values(this.props.graph.policies || {});
		return <div>
			<h2 className='title'>Policies</h2>

			<hr/>
			<div>
				<div>
					<textarea
						style={{ width: '100%', maxWidth: '100%', fontSize: '12px' }}
						ref='new-policy'
						cols='30'
					></textarea>
				</div>
				<button onClick={this.addPolicy}>add</button>
			</div>
			<hr/>

			{policies
				.map((item) => {
					return <JSONTree
						theme={theme}
						data={R.omit(['modelComponentType'], item)}
						key={'policy-'+item.id}
					/>;
				})
			}
		</div>;
	},

	addPolicy: function(event) {
		const textarea = this.refs['new-policy'];
		const policyJSON = textarea.value;
		try {
			const policy = JSON.parse(policyJSON);
			this.context.dispatch(
				actionCreators.addPolicy(policy)
			);
		} catch (e) {
			alert('Invalid JSON');
			return;
		}
		textarea.value = '';
	},

	addProcess: function(event) {
		const textarea = this.refs['new-process'];
		const processJSON = textarea.value;
		try {
			const process = JSON.parse(processJSON);
			this.context.dispatch(
				actionCreators.addProcess(process)
			);
		} catch (e) {
			alert('Invalid JSON');
			return;
		}
		textarea.value = '';
	},

	renderProcesses: function() {
		const processes = R.values(this.props.graph.processes || {});
		return <div>
			<h2 className='title'>Processes</h2>

			<hr/>
			<div>
				<div>
					<textarea
						style={{ width: '100%', maxWidth: '100%', fontSize: '12px' }}
						ref='new-process'
						cols='30'
					></textarea>
				</div>
				<button onClick={this.addProcess}>add</button>
			</div>
			<hr/>

			{processes
				.map((item) => {
					return <JSONTree
						theme={theme}
						data={R.omit(['modelComponentType'], item)}
						key={'process-'+item.id}
					/>;
				})
			}
		</div>;
	},

	renderAttackerActor: function() {
		const props = this.props;
		const actors = R.values(props.graph.nodes)
			.filter((item) => {
				return item.modelComponentType === 'actor';
			});

		return <div>
			<h3>Select attacker</h3>
			<select
				value={props.attackerActorId}
				onChange={this.setAttackerActor}
			>
				<option value=''>— select attacker —</option>
				{actors
					.map(this.renderOption)
				}
			</select>
		</div>;
	},

	renderAttackerProfile: function(props) {
		return <div>
			{this.renderAttackerActor()}
			<hr/>

			<h2 className='title'>Attacker profile</h2>
			<AttackerProfileEditor
				profile={props.attackerProfile}
				profilePresets={props.attackerProfiles}
				handleUpdate={this.handleAttackerProfileUpdate}
			/>
		</div>;
	},

	handleAttackerProfileUpdate: function(profile) {
		this.context.dispatch( actionCreators.attackerProfileChanged(profile) );
	},

	handleAttackerProfitUpdate: function(event) {
		const profit = event.target.value;
		this.context.dispatch( actionCreators.setAttackerProfit(profit) );
	},

	renderAttackerGoal: function() {
		const props = this.props;

		const goalValue = (!!props.attackerGoal && !!props.attackerGoalType)
			? props.attackerGoal[props.attackerGoalType].asset || ''
			: '';

		return <div>
			<h3>Attacker goal</h3>
			<select
				value={goalValue}
				onChange={this.setAttackerGoal}
			>
				<option value=''>— select goal —</option>
				{R.values(props.graph.nodes)
					.filter((item) => {
						return item.modelComponentType === 'item' ||
							item.modelComponentType === 'data';
					})
					.map(this.renderOption)
				}
			</select>
			<br/>
			<input
				type='number'
				className='form-control'
				placeholder='attacker
				profit'
				value={props.attackerProfit}
				onChange={this.handleAttackerProfitUpdate}
			/>
		</div>;
	},

	renderToolChainSelection: function() {
		const props = this.props;

		return <div>
			<h3>Tool chains</h3>
			<select ref='toolchain'
				onChange={this.setSelectedToolChain}
				value={props.toolChainId}>
				<option value=''>— select tool chain —</option>
				{R.values(props.toolChains)
					.map((chain) => {
						return <option
							key={chain.id}
							value={chain.id}>
							{chain.name}
						</option>;
					})
				}
			</select>
		</div>;
	},

	renderDownloadButtons: function(isReadyToDownload=false) {
		return <div>
			<button
				onClick={this.downloadModelXML}
				className='btn btn-default btn-xs'>
				Save current model as XML
			</button>
			<br/>
			<button
				onClick={this.downloadZippedScenario}
				disabled={!isReadyToDownload}
				className='btn btn-default btn-xs'>
				Save model and scenario as ZIP
			</button>
		</div>;
	},

	renderRunAnalysis: function(props) {
		function pushIfFalsey(acc, item) {
			if (!item.value) {
				acc = [...acc, item.message];
			}
			return acc;
		}

		const missingForScenario = [
			{ value: props.attackerActorId, message: 'No attacker selected' },
			{ value: props.attackerGoal, message: 'No attacker goal selected' },
			{ value: props.attackerProfit, message: 'No attacker profit entered' },
		].reduce(pushIfFalsey, []);

		const missingForAnalysis = [
			{ value: props.attackerProfile, message: 'No attacker profile selected' },
			{ value: props.toolChainId, message: 'No toolchain selected' },
		].reduce(pushIfFalsey, missingForScenario);

		// check if all actorso have a an `tkb:actor_type`
		const otherWarnings = R.values(props.graph.nodes)
			// .filter(R.propEq('type', 'tkb:actor'))
			.filter(R.propEq('modelComponentType', 'actor'))
			.filter((item) => {
				return !item['tkb:actor_type'];
			})
			.map((item) => {
				return `Actor "${item.label}" does not have an actor type`;
			});

		const isReadyToDownload = (missingForScenario.length === 0);
		const isReadyToRun = (missingForAnalysis.length === 0);

		return <div>
			<h2 className='title'>Run analysis</h2>
			<hr/>
			{this.renderAttackerGoal()}
			<hr/>
			{this.renderToolChainSelection()}
			<hr/>
			{this.renderDownloadButtons(isReadyToDownload)}
			<hr/>

			<div>
				<ul>
					{otherWarnings
						.map(item => <li key={item}>{item}</li>)
					}
				</ul>
				<ul>
					{missingForAnalysis
						.map(item => <li key={item}>{item}</li>)
					}
				</ul>
			</div>

			<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				{/*<div>
					<input type='checkbox' name='checkbox-dl-scenario' ref='checkbox-dl-scenario' />&nbsp;
					<label style={{ fontWeight: 'normal' }} htmlFor='checkbox-dl-scenario'>
						Download scenario file(s)
					</label>
				</div>*/}
				<button
					disabled={!isReadyToRun}
					onClick={this.runAnalysis}
					className='btn btn-primary'
				>
					<b>Run analysis</b>
				</button>
			</div>
		</div>;
	},

	renderOption: function(item) {
		return <option
			key={item.id}
			value={item.id}
		>
			{item.label}
		</option>;
	},

	render: function() {
		const props = this.props;
		const wizardSelectedSection = props.wizardSelectedSection;

		const wizardSteps = {
			'import': { renderFn: this.renderImport },
			'locations': { renderFn: this.renderLocations },
			'assets': { renderFn: this.renderAssets },
			'actors': { renderFn: this.renderActors },
			'connections': { renderFn: this.renderConnections },
			'policies': { renderFn: this.renderPolicies },
			'processes': { renderFn: this.renderProcesses },
			'attackerprofile': { renderFn: this.renderAttackerProfile },
			'runanalysis': { renderFn: this.renderRunAnalysis },
		};

		const defaultRenderFn = () => {
			return <div>error</div>;
		};
		const renderFn = (!!wizardSteps[wizardSelectedSection])
			? wizardSteps[wizardSelectedSection].renderFn
				|| defaultRenderFn
			: defaultRenderFn;

		return (
			<div>
				{this.renderMinimap(props)}
				{this.renderOutline(props)}
				{this.renderProperties(props)}
				<hr/>

				<div id='wizard-container'>
					<div id='steps-container'>
						<Tab name='import'
							selectedSection={wizardSelectedSection}
							icon='images/icons/import-01.svg'
							tooltip='Import model'
							handleClick={R.partial(this.selectWizardStep, ['import'])}
						/>
						<Tab name='locations'
							selectedSection={wizardSelectedSection}
							icon='images/icons/location-01.svg'
							tooltip='Locations'
							handleClick={R.partial(this.selectWizardStep, ['locations'])}
						/>
						<Tab name='assets'
							selectedSection={wizardSelectedSection}
							icon='images/icons/assets-01.svg'
							tooltip='Assets'
							handleClick={R.partial(this.selectWizardStep, ['assets'])}
						/>
						<Tab name='actors'
							selectedSection={wizardSelectedSection}
							icon='images/icons/actors-01.svg'
							tooltip='Actors'
							handleClick={R.partial(this.selectWizardStep, ['actors'])}
						/>
						<Tab name='connections'
							selectedSection={wizardSelectedSection}
							icon='images/icons/edges-01.svg'
							tooltip='Connections'
							handleClick={R.partial(this.selectWizardStep, ['connections'])}
						/>
						<Tab name='policies'
							selectedSection={wizardSelectedSection}
							icon='images/icons/policies-01.svg'
							tooltip='Policies'
							handleClick={R.partial(this.selectWizardStep, ['policies'])}
						/>
						<Tab name='processes'
							selectedSection={wizardSelectedSection}
							icon='images/icons/connections-01.svg'
							tooltip='Processes'
							handleClick={R.partial(this.selectWizardStep, ['processes'])}
						/>
						<Tab name='attackerprofile'
							selectedSection={wizardSelectedSection}
							icon='images/icons/attacker_profile-01.svg'
							tooltip='Attacker profile'
							handleClick={R.partial(this.selectWizardStep, ['attackerprofile'])}
						/>
						<Tab name='runanalysis'
							selectedSection={wizardSelectedSection}
							icon='images/icons/run-01.svg'
							tooltip='Run analysis'
							handleClick={R.partial(this.selectWizardStep, ['runanalysis'])}
						/>
					</div>

					{renderFn(props)}

					{this.renderToolChainOverlay()}
				</div>
			</div>
		);
	},

	setAttackerActor: function(event) {
		const actorId = event.target.value;
		this.context.dispatch(
			actionCreators.setAttackerActor(actorId)
		);
	},

	setAttackerGoal: function(event) {
		const assetId = event.target.value;
		const goalType = 'assetGoal';
		const goalData = {
			[goalType]: {
				asset: assetId
			}
		};
		this.context.dispatch(
			actionCreators.setAttackerGoal(goalType, goalData)
		);
	},

	setSelectedToolChain: function(event) {
		// watch out: (numeric) value comes back as string
		const toolChainId = parseInt(this.refs.toolchain.value, 10);

		this.context.dispatch(
			actionCreators.setSelectedToolChain(toolChainId)
		);
	},

	runAnalysis: function() {
		const dlScenarioCheckbox = this.refs['checkbox-dl-scenario'];
		this.context.dispatch(
			actionCreators.runAnalysis(
				this.props.toolChainId,
				(!dlScenarioCheckbox) ? false : dlScenarioCheckbox.checked
			)
		);
	},

	renderToolChainOverlay: function() {
		const props = this.props;
		const context = this.context;

		if (!props.analysisRunning) {
			return null;
		}

		function onClose() {
			context.dispatch(
				actionCreators.setAnalysisRunning(false)
			);
		}

		return <ToolChainOverlay
			toolChain={props.toolChains[props.toolChainId]}
			taskStatusCategorized={props.taskStatusCategorized}
			analysisResults={props.analysisResults}
			onClose={onClose}
		/>;
	},

	clickFileButton: function(event) {
		event.preventDefault();
		$(this.refs['load-model']).click();
	},

	loadXMLFile: function(event) {
		event.preventDefault();
		const $fileInput = $(this.refs['load-model']);
		const file = $fileInput[0].files[0];
		$fileInput.val(''); // reset, so that we can import the same file again, if needed
		this.context.dispatch( actionCreators.loadXMLFile(file) );
	},

	downloadModelXML: function(event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.downloadModelXML() );
	},

	downloadZippedScenario: function(event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.downloadZippedScenario() );
	},

	selectWizardStep(name, event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.selectWizardStep(name) );
	}

});


module.exports = Wizard;

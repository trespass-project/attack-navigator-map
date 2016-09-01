const $ = require('jquery');
const R = require('ramda');
const _ = require('lodash');
const React = require('react');
const classnames = require('classnames');
const actionCreators = require('./actionCreators.js');

const GraphMinimap = require('./GraphMinimap.js');
const PropertiesPanel = require('./PropertiesPanel.js');
const UsageHint = require('./UsageHint.js');
const ComponentReference = require('./ComponentReference.js');
// const GraphOutline = require('./GraphOutline.js');
const Library = require('./components/Library/Library.js');

const OverlayTrigger = require('react-bootstrap').OverlayTrigger;
const Tooltip = require('react-bootstrap').Tooltip;

import JSONTree from 'react-json-tree';
import { AutoSizer, FlexTable, FlexColumn/*, SortDirection*/ } from 'react-virtualized';

const PredicateEditor = require('./PredicateEditor.js');
const AttackerProfileEditor = require('./AttackerProfileEditor/AttackerProfileEditor.js');


// const colorMap = theme => ({
// 	BACKGROUND_COLOR: theme.base00,
// 	TEXT_COLOR: theme.base07,
// 	STRING_COLOR: theme.base0B,
// 	DATE_COLOR: theme.base0B,
// 	NUMBER_COLOR: theme.base09,
// 	BOOLEAN_COLOR: theme.base09,
// 	NULL_COLOR: theme.base08,
// 	UNDEFINED_COLOR: theme.base08,
// 	FUNCTION_COLOR: theme.base08,
// 	SYMBOL_COLOR: theme.base08,
// 	LABEL_COLOR: theme.base0D,
// 	ARROW_COLOR: theme.base0D,
// 	ITEM_STRING_COLOR: theme.base0B,
// 	ITEM_STRING_EXPANDED_COLOR: theme.base03
// });
const jsonTreeTheme = {
	scheme: 'scheme',
	author: 'author',
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
	base0F: '#000000',
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
		isDisabled: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			isDisabled: false,
		};
	},

	render() {
		const props = this.props;
		const isSelected = (props.selectedSection === props.name);

		const onClick = (!props.isDisabled)
			? props.handleClick
			: () => {};

		const tooltip = <Tooltip id={props.name}>{props.tooltip}</Tooltip>;
		const tab = <div
			className={classnames(
				'step-icon',
				{ selected: isSelected },
				{ disabled: props.isDisabled }
			)}
			onClick={onClick}
		>
			<span className={props.icon} />
		</div>;

		return (!props.isDisabled)
			? <OverlayTrigger placement='left' overlay={tooltip} >
				{tab}
			</OverlayTrigger>
			: tab;
	},
});


const Wizard = React.createClass({
	contextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
	},

	// getDefaultProps() {
	// 	return {};
	// },

	renderMinimap(props) {
		return <GraphMinimap
			id='minimap'
			hasOpenMap={props.hasOpenMap}
			graph={props.graph}
			theme={this.context.theme}
			showEdges={true}
		/>;
	},

	renderOutline(props) {
		return null; // TODO: implement some sort of debug view
		// return <div>
		// 	<h3 className='title'>outline</h3>
		// 	<GraphOutline graph={props.graph} />
		// </div>;
	},

	renderProperties(props) {
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

	renderImport() {
		const props = this.props;

		return <div>
			<h2 className='title'>New</h2>
			<button
				onClick={this.clickCreateNew}
				className='btn btn-default btn-xs'
			>
				Create new map
			</button>

			<br />
			<br />

			<h2 className='title'>Import</h2>
			<input
				style={{ display: 'none' }}
				ref='load-model'
				type='file'
				accept='.xml'
				onChange={this.loadModelFile}
			/>

			<button
				onClick={this.clickFileButton}
				className='btn btn-default btn-xs'
			>
				Load model XML file
			</button>

			<br />
			<br />

			<h2 className='title'>Recent models</h2>
			<div className='recent-models'>
				<AutoSizer>{
					({ height, width }) => <FlexTable
						width={width}
						height={300}
						disableHeader={false}
						headerHeight={24}
						rowHeight={24}
						rowGetter={({ index }) => props.recentModels[index]}
						rowCount={props.recentModels.length}
						onRowClick={
							({ index }) => {
								this.loadModelFromKb(props.recentModels[index].model_id);
							}
						}
					>
					{/*
						sort={
							({ sortBy, sortDirection }) => {
								console.log(sortBy, sortDirection);
								return R.sortBy(R.prop(sortBy));
							}
						}
					*/}
						<FlexColumn
							dataKey='title'
							label='title'
							className='title'
							disableSort={false}
							width={1}
							flexGrow={1}
						/>
						<FlexColumn
							dataKey='date-modified'
							label='mod. date'
							className='date'
							disableSort={false}
							width={1}
							flexGrow={1}
							flexShrink={0}
						/>
					</FlexTable>
				}</AutoSizer>
			</div>
		</div>;
	},

	renderPatterns() {
		const props = this.props;
		return <div>
			<div className='pattern-lib'>
				<Library
					items={props.modelPatterns}
					key={'locations-patterns'}
					title='patterns'
				/>
			</div>
		</div>;
	},

	renderLocations(props) {
		const items = props.componentsLib.filter(componentTypesFilter(['location']));
		return <div>
			<h2 className='title'>Locations</h2>

			<div className='component-lib'>
				<Library
					key={'locations-components'}
					items={items}
					title='components'
				/>
			</div>
		</div>;
	},

	renderAssets(props) {
		const items = props.componentsLib.filter(componentTypesFilter(['item', 'data']));
		return <div>
			<h2 className='title'>Assets</h2>
			<div className='component-lib'>
				<Library
					key={'assets-components'}
					items={items}
					title='components'
				/>
			</div>
		</div>;
	},

	renderActors(props) {
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
					title='components'
				/>
			</div>
		</div>;
	},

	renderConnections() {
		const props = this.props;
		const predicates = R.values(props.graph.predicates || {});
		return <div>
			<h2 className='title'>Predicates</h2>
			<PredicateEditor
				edges={props.predicateEdges}
				nodes={props.graph.nodes}
				relationTypes={props.relationTypes}
				relationsMap={props.relationsMap}
				predicates={predicates}
				handleCreate={this.createPredicate}
				handleUpdate={this.updatePredicate}
			/>
		</div>;
	},

	createPredicate(predicate) {
		this.context.dispatch(
			actionCreators.addPredicate(predicate)
		);
	},

	updatePredicate(predicateId, newProperties) {
		this.context.dispatch(
			actionCreators.predicateChanged(predicateId, newProperties)
		);
	},

	renderPolicies() {
		const policies = R.values(this.props.graph.policies || {});
		return <div>
			<h2 className='title'>Policies</h2>

			<hr />
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
			<hr />

			{policies
				.map((item) => {
					// isLightTheme={true}
					// theme={jsonTreeTheme}
					return <JSONTree
						data={R.omit(['modelComponentType'], item)}
						key={`policy-${item.id}`}
					/>;
				})
			}
		</div>;
	},

	addPolicy(event) {
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

	addProcess(event) {
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

	renderProcesses() {
		const processes = R.values(this.props.graph.processes || {});
		return <div>
			<h2 className='title'>Processes</h2>

			<hr />
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
			<hr />

			{processes
				.map((item) => {
					// theme={theme}
					return <JSONTree
						data={R.omit(['modelComponentType'], item)}
						key={`process-${item.id}`}
					/>;
				})
			}
		</div>;
	},

	renderAttackerActor() {
		const props = this.props;
		const actors = R.values(props.graph.nodes)
			.filter((item) => {
				return item.modelComponentType === 'actor';
			});

		return <div>
			<h3>Select attacker</h3>
			<select
				value={props.attackerActorId || ''}
				onChange={this.setAttackerActor}
			>
				<option value=''>— select attacker —</option>
				{actors
					.map(this.renderOption)
				}
			</select>
		</div>;
	},

	renderAttackerProfile(props) {
		return <div>
			{this.renderAttackerActor()}
			<hr />

			<UsageHint>only presets work, currently</UsageHint>
			<h2 className='title'>Attacker profile</h2>
			<AttackerProfileEditor
				profile={props.attackerProfile}
				profilePresets={props.attackerProfiles}
				handleUpdate={this.handleAttackerProfileUpdate}
			/>
		</div>;
	},

	handleAttackerProfileUpdate(profile) {
		this.context.dispatch( actionCreators.attackerProfileChanged(profile) );
	},

	handleAttackerProfitUpdate(event) {
		const profit = event.target.value;
		this.context.dispatch( actionCreators.setAttackerProfit(profit) );
	},

	renderAttackerGoal() {
		const props = this.props;

		const goalValue = (!!props.attackerGoal && !!props.attackerGoalType)
			? props.attackerGoal[props.attackerGoalType].asset || ''
			: '';

		return <div>
			<h3>Attacker goal</h3>
			<select
				value={goalValue || ''}
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
			<br />
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

	renderToolChainSelection() {
		const props = this.props;

		return <div>
			<h3>Tool chains</h3>
			<select
				ref='toolchain'
				onChange={this.setSelectedToolChain}
				value={props.toolChainId || ''}
			>
				<option value=''>— select tool chain —</option>
				{R.values(props.toolChains)
					.map((chain) => {
						return <option
							key={chain.id}
							value={chain.id}
						>
							{chain.name}
						</option>;
					})
				}
			</select>
		</div>;
	},

	renderDownloadButtons(isReadyToDownload=false) {
		return <div>
			<button
				onClick={this.downloadModelXML}
				className='btn btn-default btn-xs'
			>
				Save current model as XML
			</button>
			<br />
			<button
				onClick={this.downloadZippedScenario}
				disabled={!isReadyToDownload}
				className='btn btn-default btn-xs'
			>
				Save model and scenario as ZIP
			</button>
		</div>;
	},

	renderRunAnalysis(props) {
		const dispatch = this.context.dispatch;

		function pushIfFalsey(acc, item) {
			return (!item.value)
				? [...acc, item.message]
				: acc;
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

		const otherWarnings = R.values(props.validation.componentWarnings)
			.map((item) => {
				const node = props.graph.nodes[item.id];
				return item.messages
					.map((message, index) => {
						const hoverable = <ComponentReference
							modelComponent={node}
						>
							{`${node.modelComponentType} "${node.label}"`}
						</ComponentReference>;
						return <li key={`${node.id}-${index}`}>{hoverable} {message}</li>;
					});
			})
			.reduce((acc, messages) => [...acc, ...messages], []);

		const isReadyToDownload = (missingForScenario.length === 0);
		const isReadyToRun = (missingForAnalysis.length === 0);

		return <div>
			<h2 className='title'>Run analysis</h2>
			<hr />
			{this.renderAttackerGoal()}
			<hr />
			{this.renderToolChainSelection()}
			<hr />
			{this.renderDownloadButtons(isReadyToDownload)}
			<hr />

			<div className='problems-section'>
				{(_.isEmpty(otherWarnings) && _.isEmpty(missingForAnalysis))
					? null
					: <h3>Problems</h3>
				}
				<ul>
					{otherWarnings}
				</ul>
				<ul>
					{missingForAnalysis
						.map(item => <li key={item}>{item}</li>)
					}
				</ul>
			</div>

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
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

	renderOption(item) {
		return <option
			key={item.id}
			value={item.id}
		>
			{item.label}
		</option>;
	},

	render() {
		const props = this.props;
		const wizardSelectedSection = props.wizardSelectedSection;

		const wizardSteps = {
			'import': {
				icon: 'icon-import',
				tooltip: 'Import / create model',
				handleClick: R.partial(this.selectWizardStep, ['import']),
				renderFn: this.renderImport,
			},
			'patterns': {
				icon: 'icon-network',
				tooltip: 'Model patterns',
				handleClick: R.partial(this.selectWizardStep, ['patterns']),
				renderFn: this.renderPatterns,
			},
			'locations': {
				icon: 'icon-location',
				tooltip: 'Locations',
				handleClick: R.partial(this.selectWizardStep, ['locations']),
				renderFn: this.renderLocations,
			},
			'assets': {
				icon: 'icon-assets',
				tooltip: 'Assets',
				handleClick: R.partial(this.selectWizardStep, ['assets']),
				renderFn: this.renderAssets,
			},
			'actors': {
				icon: 'icon-actors',
				tooltip: 'Actors',
				handleClick: R.partial(this.selectWizardStep, ['actors']),
				renderFn: this.renderActors,
			},
			'connections': {
				icon: 'icon-edges',
				tooltip: 'Predicates',
				handleClick: R.partial(this.selectWizardStep, ['connections']),
				renderFn: this.renderConnections,
			},
			'policies': {
				icon: 'icon-policies',
				tooltip: 'Policies',
				handleClick: R.partial(this.selectWizardStep, ['policies']),
				renderFn: this.renderPolicies,
			},
			'processes': {
				icon: 'icon-connections',
				tooltip: 'Processes',
				handleClick: R.partial(this.selectWizardStep, ['processes']),
				renderFn: this.renderProcesses,
			},
			'attackerprofile': {
				icon: 'icon-attackerprofile',
				tooltip: 'Attacker profile',
				handleClick: R.partial(this.selectWizardStep, ['attackerprofile']),
				renderFn: this.renderAttackerProfile,
			},
			'runanalysis': {
				icon: 'icon-run',
				tooltip: 'Run analysis',
				handleClick: R.partial(this.selectWizardStep, ['runanalysis']),
				renderFn: this.renderRunAnalysis,
			},
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
				<hr />

				<div id='wizard-container'>
					<div id='steps-container'>
						{R.keys(wizardSteps)
							.map((stepName) => {
								const step = wizardSteps[stepName];
								const isDisabled = !props.hasOpenMap && (stepName !== 'import');
								return <Tab
									key={stepName}
									name={stepName}
									isDisabled={isDisabled}
									selectedSection={wizardSelectedSection}
									icon={step.icon}
									tooltip={step.tooltip}
									handleClick={step.handleClick}
								/>;
							})
						}
					</div>

					{renderFn(props)}
				</div>
			</div>
		);
	},

	setAttackerActor(event) {
		const actorId = event.target.value;
		this.context.dispatch(
			actionCreators.setAttackerActor(actorId)
		);
	},

	setAttackerGoal(event) {
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

	setSelectedToolChain(event) {
		// watch out: (numeric) value comes back as string
		const toolChainId = parseInt(this.refs.toolchain.value, 10);

		this.context.dispatch(
			actionCreators.setSelectedToolChain(toolChainId)
		);
	},

	runAnalysis() {
		const props = this.props;
		this.context.dispatch(
			actionCreators.runAnalysis(
				props.metadata.id,
				props.toolChainId
			)
		);
	},

	clickCreateNew(event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.createNewMap() );
	},

	clickFileButton(event) {
		event.preventDefault();
		$(this.refs['load-model']).click();
	},

	loadModelFile(event) {
		event.preventDefault();
		const $fileInput = $(this.refs['load-model']);
		const file = $fileInput[0].files[0];
		$fileInput.val(''); // reset, so that we can import the same file again, if needed
		this.context.dispatch( actionCreators.loadModelFile(file) );
	},

	loadModelFromKb(modelId) {
		this.context.dispatch( actionCreators.loadModelFromKb(modelId) );
	},

	downloadModelXML(event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.downloadModelXML() );
	},

	downloadZippedScenario(event) {
		event.preventDefault();
		const modelId = this.props.metadata.id;
		this.context.dispatch( actionCreators.downloadZippedScenario(modelId) );
	},

	selectWizardStep(name, event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.selectWizardStep(name) );
	}

});


module.exports = Wizard;

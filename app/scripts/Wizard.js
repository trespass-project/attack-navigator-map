const $ = require('jquery');
const R = require('ramda');
const _ = require('lodash');
const React = require('react');
const slugify = require('mout/string/slugify');
const actionCreators = require('./actionCreators.js');
// const GraphMinimap = require('./GraphMinimap.js');
// const GraphOutline = require('./GraphOutline.js');
const PropertiesPanel = require('./PropertiesPanel.js');
const DividingSpace = require('./DividingSpace.js');
const ComponentReference = require('./ComponentReference.js');
const Library = require('./components/Library/Library.js');
const WizardTab = require('./WizardTab.js');
const MapInfo = require('./MapInfo.js');
const PolicyEditor = require('./PolicyEditor.js');
const ProcessEditor = require('./ProcessEditor.js');
const PredicateEditor = require('./PredicateEditor.js');
const AttackerProfileEditor = require('./AttackerProfileEditor/AttackerProfileEditor.js');
import JSONTree from 'react-json-tree';
import { AutoSizer, FlexTable, FlexColumn/*, SortDirection*/ } from 'react-virtualized';
const policyCommon = require('./policyCommon.js');
const processCommon = require('./processCommon.js');


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


const Wizard = React.createClass({
	contextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
		saveMap: React.PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {};
	},

	renderMinimap(props) {
		return null;
		// return <GraphMinimap
		// 	id='minimap'
		// 	hasOpenMap={props.hasOpenMap}
		// 	graph={props.graph}
		// 	nodesList={props.nodesList}
		// 	theme={this.context.theme}
		// 	showEdges={true}
		// />;
	},

	renderOutline(props) {
		return null; // TODO: implement some sort of debug view
		// return <div>
		// 	<h3 className='title'>outline</h3>
		// 	<GraphOutline graph={props.graph} />
		// </div>;
	},

	renderMapInfo() {
		const { props } = this;

		return <div>
			<h3 className='title'>Map</h3>
			<MapInfo
				hasOpenMap={props.hasOpenMap}
				metadata={props.metadata}
				saveMap={props.saveMap}
			/>
		</div>;
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
		const inputProps = {
			type: 'file',
			accept: '.xml',
		};

		return <div>
			<button
				id='create-new-map'
				onClick={this.clickCreateNew}
				className='btn btn-default custom-button'
			>
				Create new map
			</button>

			<DividingSpace />

			<div style={{ display: 'none' }}>
				<input
					ref='load-model'
					onChange={this.loadModelFile}
					{...inputProps}
				/>
				<input
					ref='merge-model'
					onChange={this.mergeModelFile}
					{...inputProps}
				/>
			</div>

			<button
				id='import-model-file'
				onClick={this.clickFileButton}
				className='btn btn-default custom-button'
			>
				Import model file
			</button>

			<DividingSpace />

			<button
				onClick={this.clickFileMergeButton}
				className='btn btn-default custom-button'
				disabled={!props.hasOpenMap}
			>
				Merge model file
			</button>

			<br />
			<br />

			<h3 className='title'>Recent models</h3>
			<div className='recent-models' id='recent-models'>
				<AutoSizer>{
					({ height, width }) => <FlexTable
						width={width}
						height={Infinity}
						disableHeader={true}
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
					deletable={true}
					onRemove={(id) => {
						this.context.dispatch(
							actionCreators.deleteModelPattern(
								this.props.metadata.id,
								id
							)
						);
					}}
				/>
			</div>
		</div>;
	},

	renderLocations(props) {
		return <div>
			<div className='component-lib'>
				<Library
					key={'locations-components'}
					items={props.componentsLibCategorized['locations']}
					title='locations'
				/>
			</div>
		</div>;
	},

	renderAssets(props) {
		return <div>
			<div className='component-lib'>
				<Library
					key={'assets-components'}
					items={props.componentsLibCategorized['assets']}
					title='assets'
				/>
			</div>
		</div>;
	},

	renderActors(props) {
		return <div>
			<div className='component-lib'>
				<Library
					key={'actors-components'}
					items={props.componentsLibCategorized['actors']}
					title='actors'
				/>
			</div>
		</div>;
	},

	renderConnections() {
		const props = this.props;
		return <div>
			<h3 className='title'>Predicates</h3>
			<PredicateEditor
				edges={props.predicateEdges}
				nodes={props.graph.nodes}
				nodesList={props.nodesList}
				relationTypes={props.relationTypes}
				relationsMap={props.relationsMap}
				predicates={props.predicatesList}
				handleCreate={this.createPredicate}
				handleUpdate={this.updatePredicate}
				selectedEdgeId={
					(props.selectedType === 'edge')
						? props.selectedId
						: undefined
				}
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
		const props = this.props;
		// TODO: memoize values
		const policies = R.values(props.graph.policies || {});

		return <div className='policies'>
			<h3 className='title'>Policies</h3>

			{/*<DividingSpace />*/}

			<button
				onClick={this.addPolicy}
				className='btn btn-default custom-button'
			>Add policy</button>

			<DividingSpace />

			<ul>
				{policies
					.map((item) => {
						return <li key={item.id}>
							<PolicyEditor
								nodes={props.graph.nodes}
								nodesList={props.nodesList}
								policy={item}
								onChange={this.updatePolicy}
								onRemove={() => { this.removePolicy(item.id); }}
								locationOptions={props.locationOptions}
								relationTypes={props.relationTypes}
								relationsMap={props.relationsMap}
							/>
						</li>;
					})
				}
			</ul>
		</div>;
	},

	addPolicy(event) {
		if (event) { event.preventDefault(); }
		this.context.dispatch(
			actionCreators.addPolicy(policyCommon.emptyPolicy)
		);
	},

	updatePolicy(updatedPolicy) {
		this.context.dispatch(
			actionCreators.updatePolicy(updatedPolicy)
		);
	},

	removePolicy(policyId) {
		this.context.dispatch(
			actionCreators.removePolicy(policyId)
		);
	},

	// addProcess(event) {
	// 	const textarea = this.refs['new-process'];
	// 	const processJSON = textarea.value;
	// 	try {
	// 		const process = JSON.parse(processJSON);
	// 		this.context.dispatch(
	// 			actionCreators.addProcess(process)
	// 		);
	// 	} catch (e) {
	// 		alert('Invalid JSON');
	// 		return;
	// 	}
	// 	textarea.value = '';
	// },
	addProcess(event) {
		if (event) { event.preventDefault(); }
		this.context.dispatch(
			actionCreators.addProcess(
				processCommon.emptyProcess
			)
		);
	},

	updateProcess(updatedProcess) {
		this.context.dispatch(
			actionCreators.updateProcess(updatedProcess)
		);
	},

	removeProcess(processId) {
		this.context.dispatch(
			actionCreators.removeProcess(processId)
		);
	},

	renderProcesses() {
		const { props } = this;
		// TODO: memoize values
		const processes = R.values(props.graph.processes || {});

		return <div className='processes'>
			<h3 className='title'>Processes</h3>

			<button
				onClick={this.addProcess}
				className='btn btn-default custom-button'
			>Add process</button>

			<DividingSpace />

			<ul>
				{processes
					.map((item) => {
						return <li key={item.id}>
							<ProcessEditor
								nodes={props.graph.nodes}
								nodesList={props.nodesList}
								process={item}
								onChange={this.updateProcess}
								onRemove={() => { this.removeProcess(item.id); }}
								locationOptions={props.locationOptions}
								relationTypes={props.relationTypes}
								relationsMap={props.relationsMap}
							/>
						</li>;
					})
				}
			</ul>

			<DividingSpace />

			{/*<div>
				<div>
					<textarea
						style={{ width: '100%', maxWidth: '100%', fontSize: '12px' }}
						ref='new-process'
						cols='30'
					></textarea>
				</div>
				<button onClick={this.addProcess}>add</button>
			</div>
			<hr />*/}

			{/*processes
				.map((item) => {
					// theme={theme}
					return <JSONTree
						data={R.omit(['modelComponentType'], item)}
						key={`process-${item.id}`}
					/>;
				})*/
			}
		</div>;
	},

	renderAttackerActor() {
		const props = this.props;
		const actors = props.nodesList
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

			<h3 className='title'>Attacker profile</h3>
			<AttackerProfileEditor
				profile={props.attackerProfile}
				profilePresets={props.attackerProfiles}
				selectedPresetId={props.selectedAttackerProfileId}
				isComplete={props.attackerProfileIsComplete}
				handleUpdate={this.handleAttackerProfileUpdate}
				handleSave={this.handleAttackerProfileSave}
				handleDeletion={this.handleAttackerProfileDeletion}
			/>
		</div>;
	},

	handleAttackerProfileUpdate(profile) {
		this.context.dispatch(
			actionCreators.attackerProfileChanged(profile)
		);
	},

	handleAttackerProfileDeletion(profileId) {
		this.context.dispatch(
			actionCreators.deleteAttackerProfile(profileId)
		);
	},

	handleAttackerProfileSave(profile) {
		profile.id = profile.id || slugify(profile.codename);
		this.context.dispatch(
			actionCreators.saveAttackerProfile(profile)
		);
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
				{props.nodesList
					.filter((item) => {
						return item.modelComponentType === 'item' ||
							item.modelComponentType === 'data';
					})
					.map(this.renderOption)
				}
			</select>
			<DividingSpace />
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
				className='btn btn-default custom-button'
			>
				Download model
			</button>
			<DividingSpace />
			<button
				onClick={this.downloadZippedScenario}
				disabled={!isReadyToDownload}
				className='btn btn-default custom-button'
			>
				Download scenario
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
						>{node.label}</ComponentReference>;
						return <li key={`${node.id}-${index}`}>
							{/*node.modelComponentType*/} {hoverable} {message}
						</li>;
					});
			})
			.reduce((acc, messages) => [...acc, ...messages], []);

		const isReadyToDownload = (missingForScenario.length === 0);
		const isReadyToRun = (missingForAnalysis.length === 0);

		const noProblems = (_.isEmpty(otherWarnings) && _.isEmpty(missingForAnalysis));

		return <div>
			{/*<h3 className='title'>Run analysis</h3>
			<hr />*/}
			{this.renderAttackerGoal()}
			<hr />
			{this.renderToolChainSelection()}
			<hr />
			{this.renderDownloadButtons(isReadyToDownload)}
			<hr />

			<div className='problems-section'>
				{(noProblems)
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
				{(noProblems)
					? null
					: <hr />
				}
			</div>

			<div>
				<button
					disabled={!isReadyToRun}
					onClick={this.runAnalysis}
					className='btn btn-primary custom-button'
				>
					Run analysis
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

		return <div id='wiz'>
			<div className='info-and-properties'>
				{/*this.renderMinimap(props)*/}
				{/*this.renderOutline(props)*/}
				{this.renderMapInfo()}
				{this.renderProperties(props)}
			</div>

			<hr id='divider' />

			<div id='wizard-container'>
				<div id='steps-container'>
					{R.keys(wizardSteps)
						.map((stepName) => {
							const step = wizardSteps[stepName];
							const isDisabled = !props.hasOpenMap && (stepName !== 'import');
							return <WizardTab
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
		</div>;
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
				props.toolChainId,
				props.selectedAttackerProfileId
			)
		);
	},

	clickCreateNew(event) {
		event.preventDefault();
		this.context.dispatch( actionCreators.createNewMap() );
	},

	clickFileButton(event) {
		event.preventDefault();
		const fileInput = this.refs['load-model'];
		$(fileInput).click();
	},

	clickFileMergeButton(event) {
		event.preventDefault();
		const fileInput = this.refs['merge-model'];
		$(fileInput).click();
	},

	getFileAndResetInput(ref) {
		const fileInput = this.refs[ref];
		const file = fileInput.files[0];

		// reset, so that we can import the same file again, if needed
		$(fileInput).val('');

		return file;
	},

	loadModelFile(event) {
		event.preventDefault();
		const file = this.getFileAndResetInput('load-model');
		this.context.dispatch( actionCreators.loadModelFile(file) );
	},

	mergeModelFile(event) {
		event.preventDefault();
		const file = this.getFileAndResetInput('merge-model');
		this.context.dispatch( actionCreators.mergeModelFile(file) );
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
	},
});


module.exports = Wizard;

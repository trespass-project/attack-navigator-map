'use strict';

var R = require('ramda');
var React = require('react');
// var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var FluxComponent = require('flummox/component');
var helpers = require('./helpers.js');
const constants = require('./constants.js');

var GraphMinimap = require('./Graph.js').GraphMinimap;
var PropertiesPanel = require('./PropertiesPanel.js');
var Library = require('./components/Library/Library.js');


function handleAdd() {
	console.log('here');
}


var Wizard = React.createClass({
	// mixins: [PureRenderMixin],

	propTypes: {
		//
	},

	getDefaultProps: function() {
		return {
			//
		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	renderMinimap: function(props, flux) {
		return <FluxComponent flux={flux} connectToStores={[constants.GRAPH, constants.INTERFACE]}>
			<GraphMinimap id='minimap' />
		</FluxComponent>;
	},

	renderProperties: function(props, flux) {
		return <FluxComponent
			flux={flux}
			connectToStores={[constants.GRAPH, constants.INTERFACE]}>
			<PropertiesPanel
				relationsLibUrl={'data/'+constants.MODEL_RELATIONS_LIBRARY}
				id='propspanel'
			/>
		</FluxComponent>;
	},

	renderImport: function(props, flux) {
		return <div>import</div>;
	},

	renderLocations: function(props, flux) {
		return <div>
			<div id='pattern-lib'>
				<FluxComponent
					flux={flux}
					connectToStores={[constants.MODEL_PATTERNS_LIBRARY]}
					libName={constants.MODEL_PATTERNS_LIBRARY}>
					<Library
						url={'data/'+constants.MODEL_PATTERNS_LIBRARY}
						title='patterns' />
				</FluxComponent>
			</div>
			<div id='component-lib'>
				<FluxComponent
					flux={flux}
					connectToStores={[constants.MODEL_COMPONENTS_LIBRARY]}
					libName={constants.MODEL_COMPONENTS_LIBRARY}>
					<Library
						url={'data/'+constants.MODEL_COMPONENTS_LIBRARY}
						title='components'
						filter={function(a) { return a.type === 'location' }}
						onAdd={handleAdd} />
				</FluxComponent>
			</div>
		</div>;
	},

	renderAssets: function(props, flux) {
		return <div>assets</div>;
	},

	renderActors: function(props, flux) {
		return <div>actors</div>;
	},

	renderPolicies: function(props, flux) {
		return <div>policies</div>;
	},

	renderAttackerProfile: function(props, flux) {
		return <div>attacker profile</div>;
	},

	render: function() {
		const props = this.props;
		const flux = props.flux;
		const wizard = props.wizard;

		var wizardSteps = {
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

		let defaultRenderFn = function() { return <div>error</div>; };
		let renderFn = (!!wizardSteps[wizard.selectedSection])
			? wizardSteps[wizard.selectedSection].renderFn
				|| defaultRenderFn
			: defaultRenderFn;

		return (
			<div>
				{this.renderMinimap(props, flux)}
				{this.renderProperties(props, flux)}

				<div id='wizard-container'>
					<div id="steps-container">
						<div
							className="step-icon"
							onClick={R.partial(this.selectWizardStep, 'import')}
							>
							import
						</div>
						<div
							className="step-icon"
							onClick={R.partial(this.selectWizardStep, 'locations')}
							>
							locations
						</div>
						<div
							className="step-icon"
							onClick={R.partial(this.selectWizardStep, 'assets')}
							>
							assets
						</div>
						<div
							className="step-icon"
							onClick={R.partial(this.selectWizardStep, 'actors')}
							>
							actors
						</div>
						<div
							className="step-icon"
							onClick={R.partial(this.selectWizardStep, 'policies')}
							>
							policies
						</div>
						<div
							className="step-icon"
							onClick={R.partial(this.selectWizardStep, 'attacker profile')}
							>
							attacker profile
						</div>
					</div>

					{renderFn(props, flux)}


					{/*<div id='model-library'>
						<FluxComponent flux={flux} connectToStores={[constants.MODEL_LIBRARY]} libName={constants.MODEL_LIBRARY}>
							<ModelLibrary url='data/models.json' title='models' />
						</FluxComponent>
					</div>*/}


				</div>

			</div>
		);
	},


	selectWizardStep(name, event) {
		event.preventDefault();
		// console.log(name);
		this.context.interfaceActions.setSelectWizardStep(name);
	}

});


module.exports = Wizard;

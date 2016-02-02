'use strict';

const React = require('react');
const R = require('ramda');
const classnames = require('classnames');

const helpers = require('../helpers.js');

const attackerProfiles = require('../../data/attacker-profiles.js');
const common = require('./dropdown-common.js');
const DropdownSearchable = require('./DropdownSearchable.js');
const DropdownSelectize = require('./DropdownSelectize.js');


const displayAttribute = 'title';
const valueAttribute = 'value';


// TODO: store this elsewhere
const accessOptions = [
	{ value: 'internal', title: 'internal', className: 'veryhigh' },
	{ value: 'external', title: 'external', className: 'medium' }
];
const outcomesOptions = [
	{ value: 'acquisition / theft', title: 'acquisition / theft' },
	{ value: 'business advantage', title: 'business advantage' },
	{ value: 'damage', title: 'damage' },
	{ value: 'embarrassment', title: 'embarrassment' },
	{ value: 'tech advantage', title: 'tech advantage' }
];
const limitsOptions = [
	{ value: 'code of conduct', title: 'code of conduct', className: 'low' },
	{ value: 'legal', title: 'legal', className: 'medium' },
	{ value: 'extra-legal, minor', title: 'extra-legal, minor', className: 'high' },
	{ value: 'extra-legal, major', title: 'extra-legal, major', className: 'veryhigh' }
];
const resourcesOptions = [
	{ value: 'individual', title: 'individual', className: 'low' },
	{ value: 'club', title: 'club', className: 'medium' },
	{ value: 'contest', title: 'contest', className: 'high' },
	{ value: 'team', title: 'team', className: 'high' },
	{ value: 'organization', title: 'organization', className: 'veryhigh' },
	{ value: 'government', title: 'government', className: 'veryhigh' }
];
const skillOptions = [
	{ value: 'none', title: 'none', className: 'low' },
	{ value: 'minimal', title: 'minimal', className: 'medium' },
	{ value: 'operational', title: 'operational', className: 'high' },
	{ value: 'adept', title: 'adept', className: 'veryhigh' }
];
const objectivesOptions = [
	{ value: 'copy', title: 'copy' },
	{ value: 'deny', title: 'deny' },
	{ value: 'destroy', title: 'destroy' },
	{ value: 'damage', title: 'damage' },
	{ value: 'take', title: 'take' }
];
const visibilityOptions = [
	{ value: 'overt', title: 'overt' },
	{ value: 'covert', title: 'covert' },
	{ value: 'clandestine', title: 'clandestine' }
];

const options = [
	{ name: 'access', options: accessOptions },
	{ name: 'outcomes', options: outcomesOptions, multiple: true },
	{ name: 'limits', options: limitsOptions },
	{ name: 'resources', options: resourcesOptions },
	{ name: 'skill', options: skillOptions },
	{ name: 'objectives', options: objectivesOptions, multiple: true },
	{ name: 'visibility', options: visibilityOptions },
];


function getClassName(list, value) {
	if (!value) { return ''; }
	const result = R.find(R.propEq(valueAttribute, value))(list);
	return (!!result)
		? result.className
		: '';
}


const initialState = {};



let AttackerProfileEditorLanguage = React.createClass({
	propTypes: {
		handleUpdate: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			handleUpdate: () => {}
		};
	},

	getInitialState: function() {
		return initialState;
	},

	updateProfile: function(name, val) {
		let state = this.state;
		state[name] = val;
		this.setState(state, () => { this.props.handleUpdate(state); });
	},

	renderItem: function(item, index) {
		let state = this.state;

		const label = (!state[item.name])
			? state[item.name] || `[${item.name}]`
			: (item.multiple)
				? (state[item.name] || []).join(', ')
				: state[item.name];

		const barClasses = classnames(
			'bar',
			getClassName(item.options, state[item.name])
		);

		return <li key={'li-'+item.name}>
			<div className={barClasses}></div>
			<span>{item.name} {(item.multiple) ? 'are' : 'is'} </span>
			{(item.multiple)
				? <DropdownSelectize
					name={item.name}
					title={label}
					value={state[item.name]}
					items={item.options}
					displayAttribute={displayAttribute}
					valueAttribute={valueAttribute}
					handleSelection={this.updateProfile}
				/>
				: <DropdownSearchable
					name={item.name}
					title={label}
					value={state[item.name]}
					searchable={false}
					items={item.options}
					displayAttribute={displayAttribute}
					valueAttribute={valueAttribute}
					handleSelection={this.updateProfile}
				/>
			}
		</li>;
	},

	renderPresetOption: function(preset, index) {
		return <option key={preset.title} value={preset.title}>
			{preset.title}
		</option>;
	},

	render: function() {
		return (
			<div className='attackerProfile-editor-language language'>
				<div>
					Presets:<br />
					<select name='presets' onChange={this.handleSelectPreset}>
						<option value=''>— none —</option>
						{attackerProfiles.map(this.renderPresetOption)}
					</select>
				</div>
				<br />
				<div>
					<span><b>The attacker's</b></span>
					<ul>
						{options.map(this.renderItem)}
					</ul>
				</div>
			</div>
		);
	},

	handleSelectPreset: function(event) {
		const preset = helpers.getItemByKey('title', attackerProfiles, event.target.value);
		if (!!preset) {
			this.setState(preset, () => { this.props.handleUpdate(this.state); });
		}
	},
});


module.exports = AttackerProfileEditorLanguage;

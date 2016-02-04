'use strict';

const React = require('react');
const R = require('ramda');
const classnames = require('classnames');

const helpers = require('../helpers.js');

const AttackerProfile = require('../AttackerProfileEditor/AttackerProfile.js');
const attackerProfiles = require('../../data/attacker-profiles.js');
const profilePresets = attackerProfiles.profiles;
const profileOptions = attackerProfiles.options;
const DropdownSearchable = require('./DropdownSearchable.js');
const DropdownSelectize = require('./DropdownSelectize.js');


const displayAttribute = 'title';
const valueAttribute = 'value';


function getClassName(list, value) {
	if (!value) { return ''; }
	const result = R.find(R.propEq(valueAttribute, value))(list);
	return (!!result)
		? result.className
		: '';
}


let AttackerProfileEditorLanguage = React.createClass({
	propTypes: {
		handleUpdate: React.PropTypes.func,
		profile: React.PropTypes.object/*.isRequired*/
	},

	getDefaultProps: function() {
		return {
			handleUpdate: () => {}
		};
	},

	getInitialState: function() {
		return {
			title: '' // selected preset title
		};
	},

	updateProfile: function(name, val) {
		const props = this.props;
		let state = this.state;
		state[name] = val;

		state.title = '';
		profilePresets.forEach(function(profile) {
			if (helpers.areAttackerProfilesEqual(profile, state)) {
				state.title = profile.title;
			}
		});

		this.setState(state, () => {
			props.handleUpdate(state);
		});
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
		const props = this.props;

		return (
			<div className='attackerProfile-editor-language language'>
				<div>
					Presets:<br />
					<select name='presets' onChange={this.handleSelectPreset} value={this.state.title}>
						<option value=''>— none —</option>
						{profilePresets.map(this.renderPresetOption)}
					</select>
				</div>
				<br />
				<AttackerProfile profile={props.profile} />
				<br />
				<div>
					<span><b>The attacker's</b></span>
					<ul>
						{profileOptions.map(this.renderItem)}
					</ul>
				</div>
			</div>
		);
	},

	handleSelectPreset: function(event) {
		const preset = helpers.getItemByKey('title', profilePresets, event.target.value);
		if (!!preset) {
			this.setState(preset, () => { this.props.handleUpdate(this.state); });
		}
	},
});


module.exports = AttackerProfileEditorLanguage;

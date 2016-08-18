const React = require('react');
const R = require('ramda');
const _ = require('lodash');
const classnames = require('classnames');

const helpers = require('../helpers.js');

// const AttackerProfile = require('../AttackerProfileEditor/AttackerProfile.js');
const profileOptions = require('../../data/attacker-profiles.js').options;
const SelectizeDropdown = require('../SelectizeDropdown.js');


const labelKey = 'title';
const valueKey = 'value';

const profileIdAttribute = 'id';
const profileDisplayAttribute = 'codename';


function getClassName(option, value) {
	if (!value) { return ''; }
	return (!!option)
		? option.className
		: '';
}


const AttackerProfileEditorLanguage = React.createClass({
	propTypes: {
		handleUpdate: React.PropTypes.func,
		profilePresets: React.PropTypes.object/*.isRequired*/,
		profile: React.PropTypes.object/*.isRequired*/
	},

	getDefaultProps() {
		return {
			handleUpdate: () => {},
			profilePresets: {},
			profile: {},
		};
	},

	mergeWithCurrentProfile(partialProfile) {
		return _.merge(
			{},
			R.omit(['description'], this.props.profile),
			partialProfile
		);
	},

	updateProfile(name, val) {
		const props = this.props;
		const attackerProfile = this.mergeWithCurrentProfile({ [name]: val });

		// see if there is a preset that matches the current configuration
		const matchingPreset = R.find(
			(preset) => helpers.areAttackerProfilesEqual(attackerProfile, preset),
			R.values(props.profilePresets)
		);

		//  if there is one, use its id
		attackerProfile[profileIdAttribute] = (!matchingPreset)
			? ''
			: matchingPreset[profileIdAttribute];

		// report to parent
		props.handleUpdate(attackerProfile);
	},

	renderProfileParameterItem(item, index) {
		const props = this.props;

		const value = props.profile[item.name];
		const option = R.find(
			R.propEq(valueKey, value),
			item.options
		);

		const barClasses = classnames(
			'bar',
			getClassName(option, value)
		);

		// TODO: item.multiple doesn't exist anymore, currently
		const itemMultiple = false;

		// kind of hacky for now
		if (item.options.length === 1 && item.options[0].value === Number) {
			return <li key={`li-${item.name}`}>
				<div className={barClasses}></div>
				<span>{item.name} {(itemMultiple) ? 'are' : 'is'} </span>
				<input
					type='number'
					placeholder={`[${item.name}]`}
					value={value || ''}
					onChange={(event) => {
						this.updateProfile(item.name, event.target.value);
					}}
				/>
			</li>;
		}

		return <li key={`li-${item.name}`}>
			<div className={barClasses}></div>
			<span>{item.name} {(itemMultiple) ? 'are' : 'is'} </span>
			<SelectizeDropdown
				placeholder={`[${item.name}]`}
				multi={itemMultiple}
				name={item.name}
				value={option || undefined}
				options={item.options}
				labelKey={labelKey}
				valueKey={valueKey}
				onChange={this.updateProfile}
			/>
		</li>;
	},

	renderPresetOption(preset, index) {
		return <option
			key={preset[profileIdAttribute]}
			value={preset[profileIdAttribute]}
		>
			{preset[profileDisplayAttribute]}
		</option>;
	},

	render() {
		const props = this.props;

		return (
			<div className='attackerProfile-editor-language language'>
				<div>
					Presets:<br />
					<select
						name='presets'
						onChange={this.handleSelectPreset}
						value={props.profile[profileIdAttribute]}
					>
						<option value=''>— none —</option>
						{R.values(props.profilePresets).map(this.renderPresetOption)}
					</select>
				</div>

				{/*<AttackerProfile profile={props.profile} />*/}
				{(props.profile && props.profile.description)
					? <div className='profile-descrioption'>
						<br />
						{props.profile.description}
					</div>
					: null
				}
				<br />
				<div>
					<span><b>The attacker's</b></span>
					<ul>
						{profileOptions.map(this.renderProfileParameterItem)}
					</ul>
				</div>
			</div>
		);
	},

	handleSelectPreset(event) {
		const props = this.props;
		// const preset = helpers.getItemByKey(profileIdAttribute, props.profilePresets, event.target.value);
		const preset = props.profilePresets[event.target.value];
		if (!!preset) {
			const attackerProfile = _.merge(
				this.mergeWithCurrentProfile(preset),
				{ id: preset[profileIdAttribute] }
			);
			props.handleUpdate(attackerProfile);
		}
	},
});


module.exports = AttackerProfileEditorLanguage;

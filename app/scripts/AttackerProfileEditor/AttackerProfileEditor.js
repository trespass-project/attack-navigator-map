const React = require('react');
const R = require('ramda');
const _ = require('lodash');
const classnames = require('classnames');

// const AttackerProfile = require('../AttackerProfileEditor/AttackerProfile.js');
const profileOptions = require('../../data/attacker-profiles.js').options;
const SelectizeDropdown = require('../SelectizeDropdown.js');
const DividingSpace = require('../DividingSpace.js');


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


const AttackerProfileEditor = React.createClass({
	propTypes: {
		handleUpdate: React.PropTypes.func,
		handleDeletion: React.PropTypes.func,
		profilePresets: React.PropTypes.object/*.isRequired*/,
		selectedPresetId: React.PropTypes.string/*.isRequired*/,
		isComplete: React.PropTypes.bool/*.isRequired*/,
		profile: React.PropTypes.object/*.isRequired*/,
	},

	getDefaultProps() {
		return {
			handleUpdate: () => {},
			handleDeletion: () => {},
			profilePresets: {},
			selectedPresetId: '',
			isComplete: false,
			profile: {},
		};
	},

	mergeWithCurrentProfile(partialProfile) {
		return _.merge(
			{},
			this.props.profile,
			R.omit(
				['id', 'description', 'codename'],
				partialProfile
			)
		);
	},

	updateProfile(name, val) {
		const props = this.props;
		const attackerProfile = this.mergeWithCurrentProfile({ [name]: val });
		props.handleUpdate(attackerProfile); // report to parent
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

	handleSelectPreset(event) {
		const props = this.props;
		const preset = props.profilePresets[event.target.value];
		if (!!preset) {
			const attackerProfile = this.mergeWithCurrentProfile(preset);
			props.handleUpdate(attackerProfile);
		}
	},

	handleDeletePreset(event) {
		const props = this.props;
		const preset = props.profilePresets[props.selectedPresetId];
		if (!!preset) {
			props.handleDeletion(preset.id);
		}
	},

	handleSaveProfile(event) {
		const props = this.props;
		const profile = _.merge({}, props.profile, {
			codename: this.refs['new-profile-title'].value,
			description: this.refs['new-profile-description'].value,
		});
		props.handleSave(profile);
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
		const selectedPreset = props.profilePresets[props.selectedPresetId];

		return (
			<div className='attackerProfile-editor-language language'>
				<div>
					Presets:<br />
					<select
						name='presets'
						onChange={this.handleSelectPreset}
						value={props.selectedPresetId}
					>
						<option value=''>— none —</option>
						{R.values(props.profilePresets)
							.map(this.renderPresetOption)}
					</select>
				</div>

				{/*<AttackerProfile profile={props.profile} />*/}

				{(selectedPreset && selectedPreset.description) &&
					<div className='profile-description'>
						<br />
						{selectedPreset.description}
					</div>
				}
				{(!selectedPreset && props.isComplete) &&
					<div className='form-group'>
						<br />
						<div>
							<b>new profile:</b>
						</div>
						<DividingSpace />
						<div>
							<input
								ref='new-profile-title'
								className='form-control'
								type='text'
								placeholder='title'
							/>
						</div>
						<DividingSpace />
						<div>
							<textarea
								ref='new-profile-description'
								className='form-control'
								rows='3'
								placeholder='description'
							/>
						</div>
						<DividingSpace />
						<button
							onClick={this.handleSaveProfile}
							className='btn btn-default custom-button'
						>
							Save attacker profile
						</button>
					</div>
				}

				<br />

				<div>
					<span><b>The attacker's</b></span>
					<ul>
						{profileOptions.map(this.renderProfileParameterItem)}
					</ul>
				</div>

				{(selectedPreset) &&
					<a
						href='#'
						onClick={this.handleDeletePreset}
					>delete attacker profile</a>
				}
			</div>
		);
	},
});


module.exports = AttackerProfileEditor;

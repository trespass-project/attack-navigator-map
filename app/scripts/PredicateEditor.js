'use strict';

const React = require('react');
const R = require('ramda');
const classnames = require('classnames');

const helpers = require('./helpers.js');

const DropdownSearchable = require('./AttackerProfileEditor/DropdownSearchable.js');
// const DropdownSelectize = require('./AttackerProfileEditor/DropdownSelectize.js');

const displayAttribute = 'title';
const valueAttribute = 'value';


const PredicateEditor = React.createClass({
	propTypes: {
		handleUpdate: React.PropTypes.func,
		nodeNames: React.PropTypes.array.isRequired,
		predicatesLib: React.PropTypes.object.isRequired,
		predicates: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			handleUpdate: () => {}
		};
	},

	// getInitialState: function() {
	// 	return {
	// 		title: '' // selected preset title
	// 	};
	// },

	// updateProfile: function(name, val) {
	// 	const props = this.props;
	// 	let state = this.state;
	// 	state[name] = val;

	// 	state.title = '';
	// 	profilePresets.forEach(function(profile) {
	// 		if (helpers.areAttackerProfilesEqual(profile, state)) {
	// 			state.title = profile.title;
	// 		}
	// 	});

	// 	this.setState(state, () => {
	// 		props.handleUpdate(state);
	// 	});
	// },

	// renderItem: function(item, index) {
	// 	let state = this.state;

	// 	const label = (!state[item.name])
	// 		? state[item.name] || `[${item.name}]`
	// 		: (item.multiple)
	// 			? (state[item.name] || []).join(', ')
	// 			: state[item.name];

	// 	return <li key={`li-${item.name}`}>
	// 		<div className={barClasses}></div>
	// 		<span>{item.name} {(item.multiple) ? 'are' : 'is'} </span>
	// 		{(item.multiple)
	// 			? <DropdownSelectize
	// 				name={item.name}
	// 				title={label}
	// 				value={state[item.name]}
	// 				items={item.options}
	// 				displayAttribute={displayAttribute}
	// 				valueAttribute={valueAttribute}
	// 				handleSelection={this.updateProfile}
	// 			/>
	// 			: <DropdownSearchable
	// 				name={item.name}
	// 				title={label}
	// 				value={state[item.name]}
	// 				searchable={false}
	// 				items={item.options}
	// 				displayAttribute={displayAttribute}
	// 				valueAttribute={valueAttribute}
	// 				handleSelection={this.updateProfile}
	// 			/>
	// 		}
	// 	</li>;
	// },

	renderPredicate: function(predicate, index) {
		const props = this.props;
		const predicateType = props.predicatesLib[predicate.id]
			|| { id: predicate.id, subjectPlaceholder: '?', objectPlaceholder: '?' };
		const [subj, obj] = predicate.value;

		return <li key={`${subj}-${predicate.id}-${obj}`}>
			<DropdownSearchable
				name={'subject'}
				title={subj}
				value={subj}
				searchable={true}
				searchPlaceholder={predicateType.subjectPlaceholder}
				items={props.nodeNames}
				displayAttribute={'label'}
				valueAttribute={'name'}
				handleSelection={this.updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<DropdownSearchable
				name={predicate.label}
				title={predicateType.label || predicate.label}
				value={predicate.label}
				searchable={true}
				items={R.values(props.predicatesLib)}
				displayAttribute={'label'}
				valueAttribute={'id'}
				handleSelection={this.updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<DropdownSearchable
				name={'object'}
				title={obj}
				value={obj}
				searchable={true}
				searchPlaceholder={predicateType.objectPlaceholder}
				items={props.nodeNames}
				displayAttribute={'label'}
				valueAttribute={'name'}
				handleSelection={this.updatePredicate}
			/>
			<br />
		</li>;
	},

	updatePredicate: function(...args) {
		console.log(args);
	},

	render: function() {
		const props = this.props;

		return (
			<div className='predicate-editor language'>
				<div className='predicates'>
					predicates:
					<ul>
						{R.values(props.predicates).map(this.renderPredicate)}
					</ul>
				</div>

				<div className='add-new-container'>
					<hr />
					add new:
					<div>
						<input type='text' placeholder='subject placeholder' />
						<input type='text' placeholder='predicate label' />
						<input type='text' placeholder='subject placeholder' />
					</div>
					<button>add</button>
				</div>
			</div>
		);
	},

	// handleSelectPreset: function(event) {
	// 	const preset = helpers.getItemByKey('title', profilePresets, event.target.value);
	// 	if (!!preset) {
	// 		this.setState(preset, () => { this.props.handleUpdate(this.state); });
	// 	}
	// },
});


module.exports = PredicateEditor;

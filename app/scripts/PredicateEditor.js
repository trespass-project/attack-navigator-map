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
		nodes: React.PropTypes.array.isRequired,
		predicatesLib: React.PropTypes.object.isRequired,
		predicates: React.PropTypes.array.isRequired,
	},

	getDefaultProps: function() {
		return {
			handleUpdate: () => {}
		};
	},

	renderPredicate: function(predicate) {
		const props = this.props;
		const predicateType = props.predicatesLib[predicate.type]
			|| { id: predicate.type, subjectPlaceholder: '?', objectPlaceholder: '?' };
		const [subj, obj] = predicate.value;

		return <li key={`${subj}-${predicate.id}-${obj}`}>
			<DropdownSearchable
				name={'subject'}
				title={subj}
				value={subj}
				searchable={true}
				searchPlaceholder={predicateType.subjectPlaceholder}
				items={props.nodes}
				displayAttribute={'label'}
				valueAttribute={'id'}
				handleSelection={this.updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<DropdownSearchable
				name={predicateType.label}
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
				items={props.nodes}
				displayAttribute={'label'}
				valueAttribute={'id'}
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
					<h3>Predicates</h3>
					<ul>
						{props.predicates.map(this.renderPredicate)}
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

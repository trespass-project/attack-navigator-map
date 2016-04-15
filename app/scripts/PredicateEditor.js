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
		nodes: React.PropTypes.object.isRequired,
		predicatesLib: React.PropTypes.object.isRequired,
		predicates: React.PropTypes.array.isRequired,
	},

	getDefaultProps: function() {
		return {
			handleUpdate: () => {}
		};
	},

	renderPredicate: function(predicate, subjObjOptions, subjObjOptionsMap) {
		const props = this.props;
		const predicateType = props.predicatesLib[predicate.type]
			|| { id: predicate.type, subjectPlaceholder: '?', objectPlaceholder: '?' };
		const [subj, obj] = predicate.value;

		const updatePredicate = R.partial(this.updatePredicate, [predicate.id]);

		return <li key={`${subj}-${predicate.type}-${obj}`}>
			<DropdownSearchable
				name={'subject'}
				title={subjObjOptionsMap[subj].label}
				value={subj}
				searchable={true}
				searchPlaceholder={predicateType.subjectPlaceholder}
				items={subjObjOptions}
				displayAttribute={'label'}
				valueAttribute={'id'}
				handleSelection={updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<DropdownSearchable
				name={'predicate'}
				title={predicateType.label}
				value={predicate.label}
				searchable={true}
				items={R.values(props.predicatesLib)}
				displayAttribute={'label'}
				valueAttribute={'id'}
				handleSelection={updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<DropdownSearchable
				name={'object'}
				title={subjObjOptionsMap[obj].label}
				value={obj}
				searchable={true}
				searchPlaceholder={predicateType.objectPlaceholder}
				items={subjObjOptions}
				displayAttribute={'label'}
				valueAttribute={'id'}
				handleSelection={updatePredicate}
			/>
			<br />
		</li>;
	},

	updatePredicate: function(predicateId, property, value) {
		this.props.handleUpdate(predicateId, { [property]: value });
	},

	render: function() {
		const props = this.props;
		const subjObjOptions = props.predicates
			.reduce((options, predicate) => {
				const items = predicate.value
					.reduce((acc, val) => {
						// often it will be the id of a node ...
						const node = props.nodes[val];
						// ... otherwise it's just a name used in the predicate
						if (!node) {
							return [...acc, { label: val, id: val }];
						} else {
							return acc;
						}
					}, []);
				return options.concat(items);
			}, [])
			.concat(R.values(props.nodes));
		const subjObjOptionsMap = helpers.toHashMap('id', subjObjOptions);

		return (
			<div className='predicate-editor language'>
				<div className='predicates'>
					<h3>Predicates</h3>
					<ul>
						{props.predicates
							.map(pred => {
								return this.renderPredicate(pred, subjObjOptions, subjObjOptionsMap);
							}
						)}
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

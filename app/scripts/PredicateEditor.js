const React = require('react');
const R = require('ramda');

const helpers = require('./helpers.js');
const SelectizeDropdown = require('./SelectizeDropdown.js');

const labelKey = 'title';
const valueKey = 'value';


const PredicateEditor = React.createClass({
	propTypes: {
		handleCreate: React.PropTypes.func,
		handleUpdate: React.PropTypes.func,
		nodes: React.PropTypes.array.isRequired,
		predicatesLib: React.PropTypes.object.isRequired,
		predicates: React.PropTypes.array.isRequired,
	},

	getDefaultProps: function() {
		return {
			handleCreate: () => {},
			handleUpdate: () => {},
		};
	},

	renderPredicate: function(predicate, subjObjOptions, subjObjOptionsMap) {
		const props = this.props;
		const predicateType = props.predicatesLib[predicate.type]
			|| { id: predicate.type, subjectPlaceholder: '?', objectPlaceholder: '?' };
		const [subj, obj] = predicate.value;

		const updatePredicate = R.partial(this.updatePredicate, [predicate.id]);

		return <li key={`${subj}-${predicate.type}-${obj}`}>
			<SelectizeDropdown
				multi={false}
				name={'subject'}
				{/*title={subjObjOptionsMap[subj].label}*/ ...{}}
				value={subj}
				options={subjObjOptions}
				labelKey={'label'}
				valueKey={'id'}
				onChange={updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<SelectizeDropdown
				multi={false}
				name={'predicate'}
				{/*title={predicateType.label}*/ ...{}}
				value={predicate.label}
				options={R.values(props.predicatesLib)}
				labelKey={'label'}
				valueKey={'id'}
				onChange={updatePredicate}
			/>
			&nbsp;&nbsp;&nbsp;
			<SelectizeDropdown
				multi={false}
				name={'object'}
				{/*title={subjObjOptionsMap[obj].label}*/ ...{}}
				value={obj}
				options={subjObjOptions}
				labelKey={'label'}
				valueKey={'id'}
				onChange={updatePredicate}
			/>
			<br />
		</li>;
	},

	render: function() {
		const props = this.props;
		let subjObjOptions = props.predicates
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
		subjObjOptions = R.uniq(subjObjOptions);
		const subjObjOptionsMap = helpers.toHashMap('id', subjObjOptions);

		return (
			<div className='predicate-editor language'>
				<div className='predicates'>
					<h3>Predicates</h3>
					<div className='add-new-container'>
						add new:
						<div>
							<input ref='new-subject' type='text' placeholder='subject placeholder' />
							<input ref='new-predicate' type='text' placeholder='predicate label' />
							<input ref='new-object' type='text' placeholder='subject placeholder' />
						</div>
						<button onClick={this.addPredicate}>add</button>
						<hr />
					</div>

					<ul>
						{props.predicates
							.map(pred => {
								return this.renderPredicate(pred, subjObjOptions, subjObjOptionsMap);
							}
						)}
					</ul>
				</div>
			</div>
		);
	},

	addPredicate: function(event) {
		const subject = this.refs['new-subject'].value;
		const type = this.refs['new-predicate'].value;
		const object = this.refs['new-object'].value;
		const predicate = {
			type,
			value: [subject, object],
		};
		this.props.handleCreate(predicate);

		this.refs['new-subject'].value = '';
		this.refs['new-predicate'].value = '';
		this.refs['new-object'].value = '';
	},

	updatePredicate: function(predicateId, property, value) {
		this.props.handleUpdate(predicateId, { [property]: value });
	},
});


module.exports = PredicateEditor;

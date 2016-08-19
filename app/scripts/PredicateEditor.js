const React = require('react');
const R = require('ramda');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');
const ComponentReference = require('./ComponentReference.js');
const SelectizeDropdown = require('./SelectizeDropdown.js');


const RelationSelectize = React.createClass({
	render() {
		const props = this.props;

		// TODO: added ones are not persisted
		const createFromSearch = (options, search) => {
			if (!search || options.length) {
				return null;
			}
			const result = {
				label: search,
				value: search
					.toLowerCase()
					.replace(/ +/g, '-'),
			};
			return result;
		};

		return <SelectizeDropdown
			multi={false}
			name='relation'
			placeholder='relation'
			valueKey='value'
			labelKey='label'
			extraProps={{ createFromSearch }}
			{...props}
		/>;
	},
});


const SubjObjSelectize = React.createClass({
	render() {
		const props = this.props;

		// TODO: added ones are not persisted
		const createFromSearch = (options, search) => {
			if (!search || options.length) {
				return null;
			}
			const result = {
				label: search,
				value: search,
			};
			return result;
		};

		const renderValue = (item) => {
			const node = props.nodes[item[props.valueKey]];
			return (node)
				? <ComponentReference modelComponent={node}>
					{node.label}
				</ComponentReference>
				: item[props.labelKey];
		};

		return <SelectizeDropdown
			multi={false}
			extraProps={{ createFromSearch, renderValue }}
			{...props}
		/>;
	},
});


const PredicateEditor = React.createClass({
	propTypes: {
		handleCreate: React.PropTypes.func,
		handleUpdate: React.PropTypes.func,
		nodes: React.PropTypes.object.isRequired,
		edges: React.PropTypes.array.isRequired,
		relationTypes: React.PropTypes.array.isRequired,
		predicates: React.PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
			handleCreate: () => {},
			handleUpdate: () => {},
		};
	},

	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	addPredicate(event) {
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

	updatePredicate(predicateId, property, value) {
		this.props.handleUpdate(predicateId, { [property]: value });
	},

	edgeRelationChanged(name, relation, edgeId) {
		this.context.dispatch(
			actionCreators.updateComponentProperties(
				edgeId, 'edge', { relation }
			)
		);
	},

	subjObjChanged(name, value, edgeId) {
		const key = (name === 'subject') ? 'from' : 'to';
		this.context.dispatch(
			actionCreators.updateComponentProperties(
				edgeId, 'edge', { [key]: value }
			)
		);
	},

	renderPredicate(edge, index, relationsOptions, predicatesMap) {
		const props = this.props;

		const subj = <SubjObjSelectize
			nodes={props.nodes}
			placeholder='subject'
			name='subject'
			valueKey='id'
			labelKey='label'
			options={R.values(props.nodes)}
			value={{ id: edge.from, label: edge.from }}
			onChange={(name, value) => {
				this.subjObjChanged(name, value, edge.id);
			}}
		/>;

		const obj = <SubjObjSelectize
			nodes={props.nodes}
			placeholder='object'
			name='object'
			valueKey='id'
			labelKey='label'
			options={R.values(props.nodes)}
			value={{ id: edge.to, label: edge.to }}
			onChange={(name, value) => {
				this.subjObjChanged(name, value, edge.id);
			}}
		/>;

		// TODO: make it possible to add predicates
		// allow 'create from search':
		// http://furqanzafar.github.io/react-selectize/#/?category=simple
		return <li key={index}>
			<span>{subj} </span>
			<RelationSelectize
				options={relationsOptions}
				value={predicatesMap[edge.relation]}
				onChange={(name, relation) => {
					this.edgeRelationChanged(name, relation, edge.id);
				}}
			/>
			<span> {obj}</span>
		</li>;

		// const predicateType = props.relationTypes[predicate.type]
		// 	|| {
		// 		id: predicate.type,
		// 		subjectPlaceholder: '?',
		// 		objectPlaceholder: '?'
		// 	};
		// const [subj, obj] = predicate.value;

		// const updatePredicate = R.partial(this.updatePredicate, [predicate.id]);

		// return <li key={`${subj}-${predicate.type}-${obj}`}>
		// 	<SelectizeDropdown
		// 		multi={false}
		// 		name={'subject'}
		// 		{/*title={subjObjOptionsMap[subj].label}*/ ...{}}
		// 		value={subj}
		// 		options={subjObjOptions}
		// 		labelKey={'label'}
		// 		valueKey={'id'}
		// 		onChange={updatePredicate}
		// 	/>
		// 	&nbsp;&nbsp;&nbsp;
		// 	<SelectizeDropdown
		// 		multi={false}
		// 		name={'predicate'}
		// 		{/*title={predicateType.label}*/ ...{}}
		// 		value={predicate.label}
		// 		options={R.values(props.relationTypes)}
		// 		labelKey={'label'}
		// 		valueKey={'id'}
		// 		onChange={updatePredicate}
		// 	/>
		// 	&nbsp;&nbsp;&nbsp;
		// 	<SelectizeDropdown
		// 		multi={false}
		// 		name={'object'}
		// 		{/*title={subjObjOptionsMap[obj].label}*/ ...{}}
		// 		value={obj}
		// 		options={subjObjOptions}
		// 		labelKey={'label'}
		// 		valueKey={'id'}
		// 		onChange={updatePredicate}
		// 	/>
		// 	<br />
		// </li>;
	},

	render() {
		const props = this.props;
		// TODO: do this in mapStateToProps
		const relationsMap = helpers.toHashMap('value', props.relationTypes);

		// let subjObjOptions = props.predicates
		// 	.reduce((options, predicate) => {
		// 		const items = predicate.value
		// 			.reduce((acc, val) => {
		// 				// often it will be the id of a node ...
		// 				const node = props.nodes[val];
		// 				// ... otherwise it's just a name used in the predicate
		// 				if (!node) {
		// 					return [...acc, { label: val, id: val }];
		// 				} else {
		// 					return acc;
		// 				}
		// 			}, []);
		// 		return options.concat(items);
		// 	}, [])
		// 	.concat(R.values(props.nodes));
		// subjObjOptions = R.uniq(subjObjOptions);
		// const subjObjOptionsMap = helpers.toHashMap('id', subjObjOptions);

		return (
			<div className='predicate-editor language'>
				<div className='predicates'>
					{/*<div className='add-new-container'>
						add new:
						<div>
							<input ref='new-subject' type='text' placeholder='subject placeholder' />
							<input ref='new-predicate' type='text' placeholder='predicate label' />
							<input ref='new-object' type='text' placeholder='subject placeholder' />
						</div>
						<button onClick={this.addPredicate}>add</button>
						<hr />
					</div>*/}

					<ul>
						{props.edges
							.map((edge, index) =>
								this.renderPredicate(
									edge,
									index,
									props.relationTypes,
									relationsMap
								)
						)}
					</ul>
				</div>
			</div>
		);
	},
});


module.exports = PredicateEditor;

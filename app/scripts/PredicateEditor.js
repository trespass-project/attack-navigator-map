const React = require('react');
const R = require('ramda');
const actionCreators = require('./actionCreators.js');
const modelHelpers = require('./model-helpers.js');
const ComponentReference = require('./ComponentReference.js');
const SelectizeDropdown = require('./SelectizeDropdown.js');
const RelationSelectize = require('./RelationSelectize.js');


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


const SubjObjSelectize = React.createClass({
	render() {
		const props = this.props;

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
			options={props.nodesList}
			{...R.omit(
				['nodesList'],
				props)
			}
			extraProps={{ createFromSearch, renderValue }}
		/>;
	},
});


const PredicateEditor = React.createClass({
	propTypes: {
		handleCreate: React.PropTypes.func,
		handleUpdate: React.PropTypes.func,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		edges: React.PropTypes.array.isRequired,
		relationTypes: React.PropTypes.array.isRequired,
		relationsMap: React.PropTypes.object.isRequired,
		predicates: React.PropTypes.array.isRequired,
		selectedEdgeId: React.PropTypes.string,
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

	renderPredicate(edge, index, relationTypes, relationsMap, { fromType, toType }) {
		const props = this.props;

		// filter out the impossible relation types for these
		// model model components

		const possibleTypes = !(fromType && toType)
			? relationTypes
			: modelHelpers.possibleEdgeTypes(
				relationTypes,
				fromType,
				toType
			);

		const subj = <SubjObjSelectize
			nodes={props.nodes}
			placeholder='subject'
			name='subject'
			valueKey='id'
			labelKey='label'
			options={props.nodesList}
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
			options={props.nodesList}
			value={{ id: edge.to, label: edge.to }}
			onChange={(name, value) => {
				this.subjObjChanged(name, value, edge.id);
			}}
		/>;

		const isSelected = props.selectedEdgeId === edge.id;
		const classes = (isSelected) ? 'selectedPredicate' : '';

		return <li key={index} className={classes}>
			<span>{subj} </span>
			<RelationSelectize
				options={possibleTypes}
				value={relationsMap[edge.relation]}
				onChange={(name, relation) => {
					this.edgeRelationChanged(name, relation, edge.id);
				}}
			/>
			<span> {obj}</span>
		</li>;
	},

	render() {
		const props = this.props;

		return (
			<div className='predicate-editor language'>
				<div className='predicates'>
					<ul>
						{props.edges
							.map((edge, index) => {
								const fromNode = props.nodes[edge.from];
								const toNode = props.nodes[edge.to];
								// sometimes `fromNode` and `toNode` are
								// undefined, because they are no map
								// components.
								// example: `pw isPasswordOf user`
								const fromType = R.propOr(
									undefined, 'modelComponentType', fromNode
								);
								const toType = R.propOr(
									undefined, 'modelComponentType', toNode
								);
								return this.renderPredicate(
									edge,
									index,
									props.relationTypes,
									props.relationsMap,
									{ fromType, toType }
								);
							}
						)}
					</ul>
				</div>
			</div>
		);
	},
});


module.exports = PredicateEditor;

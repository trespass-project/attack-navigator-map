'use strict';

const $ = require('jquery');
const React = require('react');
const R = require('ramda');
const _ = require('lodash');

const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');
const actionCreators = require('./actionCreators.js');
const constants = require('./constants.js');
const fakeApi = require('../../api.js');
const api = require('trespass.js').api;
const knowledgebaseApi = api.knowledgebase;


const PropertiesPanel = React.createClass({
	contextTypes: {
		// theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
		id: React.PropTypes.string.isRequired,
		graph: React.PropTypes.object.isRequired,
		selectedId: React.PropTypes.string/*.isRequired*/,
		selectedType: React.PropTypes.string/*.isRequired*/,
		relationTypes: React.PropTypes.array.isRequired,
	},

	getDefaultProps: function() {
		return {
			// relationTypes: []
		};
	},

	onChange: function(selected, event) {
		const newProperties = { [event.target.name]: event.target.value };
		this.context.dispatch(
			actionCreators.updateComponentProperties(
				selected.selectedId,
				selected.selectedType,
				newProperties
			)
		);
	},

	onSubmit: function(event) {
		event.preventDefault();
	},

	renderTypeOptions: function() {
		const nonEdgeCollectionNames = R.without(['edges'], modelHelpers.collectionNames);
		return nonEdgeCollectionNames
			.map((typePlural) => {
				const type = modelHelpers.collectionNamesSingular[typePlural];
				return <option key={type} value={type}>{type}</option>;
			});
	},

	renderProperties: function(selectedItem, graphComponentType) {
		const props = this.props;

		if (!selectedItem) {
			return null;
		}

		const arg = {
			selectedId: props.selectedId,
			selectedType: props.selectedType,
		};
		const onChange = (props.selectedId)
			? R.partial(this.onChange, [arg])
			: null;

		switch (props.selectedType) {
			case 'node':
				const node = selectedItem;
				const groupNames = modelHelpers.getNodeGroups(node.id, props.graph.groups)
					.map(R.prop('name'))
					.join(', ');
				return (
					<table>
						<tbody>
							<tr>
								<td><label>label:</label></td>
								<td>
									<input
										onChange={onChange}
										type='text'
										className='form-control'
										name='label'
										placeholder='label'
										value={node.label || ''} />
								</td>
							</tr>
							<tr>
								<td><label>id:</label></td>
								<td><span>{node.id}</span></td>
							</tr>
							<tr>
								<td><label>type:</label></td>
								<td>
									<select
										onChange={onChange}
										name='modelComponentType'
										className='form-control'
										value={node.modelComponentType}>
										{this.renderTypeOptions()}
									</select>
								</td>
							</tr>
							<tr>
								<td><label>groups:</label></td>
								<td><span>{groupNames}</span></td>
							</tr>
						</tbody>
					</table>
				);

			case 'group':
				const group = selectedItem;
				return (
					<table>
						<tbody>
							<tr>
								<td><label>name:</label></td>
								<td><input
									onChange={onChange}
									type='text'
									className='form-control'
									name='name'
									placeholder='name' value={group.name || ''} />
								</td>
							</tr>
							<tr>
								<td><label>id:</label></td>
								<td><span>{group.id}</span></td>
							</tr>
							<tr>
								<td><label>bg image:</label></td>
								<td><span>{(group._bgImage) ? group._bgImage.url : '—'}</span></td>
							</tr>
							{/*<tr>
															<td><label>children:</label></td>
															<td><span>TODO</span></td>
														</tr>*/}
						</tbody>
					</table>
				);

			case 'edge':
				const edge = selectedItem;

				// look up actual nodes by id
				const edgeNodes = modelHelpers.getEdgeNodes(edge, props.graph.nodes);

				return (
					<table>
						<tbody>
							<tr>
								<td><label>from:</label></td>
								<td><span>{edgeNodes.fromNode.label}</span></td>
							</tr>
							<tr>
								<td><label>relation:</label></td>
								<td>
									<select
										onChange={onChange}
										name='relation'
										value={edge.relation || null}>
										{props.relationTypes.map(function(relation) {
											return <option
												key={relation.label}
												value={relation.value}>
												{relation.label}
											</option>;
										})}
									</select>
								</td>
							</tr>
							<tr>
								<td><label>to:</label></td>
								<td><span>{edgeNodes.toNode.label}</span></td>
							</tr>
						</tbody>
					</table>
				);

			default:
				return (<div>TODO</div>);
		}
	},

	render: function() {
		const props = this.props;

		let selectedItem;
		if (props.selectedId /*&& props.selectedType*/) {
			const collectionName = modelHelpers.graphComponentPlural[props.selectedType];
			selectedItem = props.graph[collectionName][props.selectedId];
		}

		const selectedType = (selectedItem)
			? props.selectedType || '(unknown type)'
			: '';

		return (
			<div id={props.id} className='panel-section'>
				<h3 className='title'>
					selection{(selectedItem) ? `: ${selectedType}` : ''}
				</h3>
				<form className='form' onSubmit={this.onSubmit}>{/* form-horizontal */}
					<div className='form-group'>
						<span className='disabled'>
							{(!selectedItem)
								? 'nothing selected'
								: this.renderProperties(selectedItem, props.selectedType)}
						</span>
						{(!selectedItem)
							? null
							: <div className='kb'>
								Knowledge base:<br/>
								{this.renderKnowledgebase(selectedItem)}
							</div>}
					</div>
				</form>
			</div>
		);
	},

	renderKnowledgebase: function(selectedItem) {
		const props = this.props;

		if (props.selectedType !== 'node') {
			return null;
		}

		const kb = helpers.getItemByKey(
			'modelComponentType',
			props.componentTypes,
			selectedItem.modelComponentType
		);

		if (!kb) {
			return null;
		}

		return <div>
			{(kb.attributes || [])
				.map((attr) => {
					return <div key={attr.id}>
						{attr.label}:&nbsp;
						{(!!attr.values)
							? <select>
								{(attr.values || [])
									.map((value) => {
										return <option
											key={value['@id']}
											value={value['@id']}
										>
											{value['@label']}
										</option>;
									})
								}
							</select>
							: <input type="text" />
						}
					</div>;
				})
			}
		</div>;
	},
});


module.exports = PropertiesPanel;

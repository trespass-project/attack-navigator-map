'use strict';

const $ = require('jquery');
const React = require('react');
const R = require('ramda');
const _ = require('lodash');

const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');
const actionCreators = require('./actionCreators.js');
const constants = require('./constants.js');
const api = require('trespass.js/src/apis');
const knowledgebaseApi = api.apis.knowledgebase;


let PropertiesPanel = React.createClass({
	propTypes: {
		relationsLibUrl: React.PropTypes.string.isRequired,
		id: React.PropTypes.string.isRequired,
		graph: React.PropTypes.object.isRequired,
		selected: React.PropTypes.object/*.isRequired*/,
		dispatch: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	onChange: function(selected, event) {
		let newProperties = { [event.target.name]: event.target.value };

		const props = this.props;
		props.dispatch(
			actionCreators.updateComponentProperties(
				selected.componentId,
				selected.graphComponentType,
				newProperties
			)
		);
	},

	onSubmit: function(event) {
		event.preventDefault();
	},

	renderTypeOptions: function() {
		return R.without(['edges'], modelHelpers.modelComponents)
			.map(function(typePlural) {
				const type = modelHelpers.modelComponentsSingular[typePlural];
				return <option key={type} value={type}>{type}</option>;
			});
	},

	renderProperties: function(selectedItem, graphComponentType) {
		const props = this.props;

		if (!selectedItem) {
			return null;
		}

		const onChange = (props.selected)
			? R.partial(this.onChange, [props.selected])
			: null;

		switch (props.selected.graphComponentType) {
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
										{this.state.relationsLib.map(function(relation) {
											return <option
												key={relation.value}
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
		let state = this.state;
		const props = this.props;

		let selectedItem;
		let graphComponentType;
		let componentId;

		if (props.selected) {
			graphComponentType = props.selected.graphComponentType;
			componentId = props.selected.componentId;

			const list = {
				'node': props.graph.nodes,
				'edge': props.graph.edges,
				'group': props.graph.groups,
			}[graphComponentType] || [];
			selectedItem = helpers.getItemById(list, componentId);
		}

		const selectedType = (selectedItem)
			? graphComponentType || '(unknown type)'
			: '';

		return (
			<div id={props.id} className='panel-section'>
				<h3 className='title'>
					selection{(selectedItem) ? ': '+selectedType : ''}
				</h3>
				<form className='form' onSubmit={this.onSubmit}>{/* form-horizontal */}
					<div className='form-group'>
						<span className='disabled'>
							{(!selectedItem)
								? 'nothing selected'
								: this.renderProperties(selectedItem, graphComponentType)}
						</span>
						{(!selectedItem)
							? null
							: <div className='kb'>
								Knowledge base:<br/>
								{this.renderKnowledgebase(state.knowledgebase)}
							</div>}
					</div>
				</form>
			</div>
		);
	},

	renderKnowledgebase: function(kb) {
		if (!kb || !kb.attributes) {
			return null;
		}

		const labelToAttrData = kb.attributes
			.reduce((result, attr) => {
				result[attr['@label']] = attr;
				return result;
			}, {});

		return <div>
			{R.keys(labelToAttrData)
				.map((label) => {
					const attr = labelToAttrData[label];
					return <div key={attr['@id']}>
						{label}:&nbsp;
						<select>
							{attr['tkb:values']
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
					</div>;
				})
			}
		</div>
	},

	componentDidMount: function() {
		let that = this;
		const props = this.props;

		if (props.selected) {
			const graphComponentType = props.selected.graphComponentType;
			const componentId = props.selected.componentId;

			if (graphComponentType === 'edge') {
				// get relations
				$.ajax({
					url: props.relationsLibUrl,
					dataType: 'json',
				}).success(function(data) {
					that.setState({ relationsLib: data.list });
				});
			} else {
				// query knowledgebase
				const list = {
					node: props.graph.nodes,
					// edge: props.graph.edges,
					group: props.graph.groups,
				}[graphComponentType] || [];
				const selectedItem = helpers.getItemById(list, componentId);

				if (selectedItem) {
					if (selectedItem.kbType) {
						const params = _.merge(
							{},
							{
								url: api.makeUrl(knowledgebaseApi, 'getParameters'),
								dataType: 'json',
								data: { type: selectedItem.kbType }
							},
							api.requestOptions.crossDomain
						);
						$.ajax(params)
							.success(function(data) {
								// console.log(data);
								that.setState({
									knowledgebase: {
										attributes: data['tkb:has_attribute']
									}
								});
							})
							.fail(function(err) {
								console.error(err);
							});
					}
				}
			}

		}
	},

	getInitialState: function() {
		return {
			relationsLib: [],
			knowledgebase: {}
		};
	}

});


module.exports = PropertiesPanel;

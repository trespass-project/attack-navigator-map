const React = require('react');
const R = require('ramda');

const modelHelpers = require('./model-helpers.js');
const actionCreators = require('./actionCreators.js');


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

	getDefaultProps() {
		return {
			// relationTypes: []
		};
	},

	onChange(selected, event) {
		const newProperties = { [event.target.name]: event.target.value };
		this.context.dispatch(
			actionCreators.updateComponentProperties(
				selected.selectedId,
				selected.selectedType,
				newProperties
			)
		);
	},

	onSubmit(event) {
		event.preventDefault();
	},

	renderTypeOptions() {
		const nonEdgeCollectionNames = R.without(['edges'], modelHelpers.collectionNames);
		return nonEdgeCollectionNames
			.map((typePlural) => {
				const type = modelHelpers.collectionNamesSingular[typePlural];
				return <option key={type} value={type}>{type}</option>;
			});
	},

	renderProperties(selectedItem, graphComponentType) {
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
					.map(R.prop('label'))
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
										value={node.label || ''}
									/>
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
										value={node.modelComponentType}
									>
										{this.renderTypeOptions()}
									</select>
								</td>
							</tr>
							{(node.modelComponentType === 'data')
								? <tr>
									<td><label>value:</label></td>
									<td>
										<input
											onChange={onChange}
											name='value'
											type='text'
											className='form-control'
											value={node.value || ''}
										/>
									</td>
								</tr>
								: null
							}
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
									name='label'
									placeholder='label' value={group.label || ''} />
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
										value={edge.relation || ''}
									>
										{props.relationTypes.map((relation) => {
											return <option
												key={relation.label}
												value={relation.value}
											>
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

	render() {
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
								{/*Knowledge base:<br/>*/}
								{this.renderKnowledgebase(selectedItem)}
							</div>}
					</div>
				</form>
			</div>
		);
	},

	renderKnowledgebase(selectedItem) {
		const props = this.props;

		if (props.selectedType !== 'node') {
			return null;
		}

		const attributes = (selectedItem.type)
			? props.kbTypeAttributes[selectedItem.type]
			: undefined;
		// if (!attributes) {
		// 	return null;
		// }

		const options = props.modelComponentTypeToKbTypes[selectedItem.modelComponentType] || [];

		// TODO: DRY
		const arg = {
			selectedId: props.selectedId,
			selectedType: props.selectedType,
		};
		const onChange = (props.selectedId)
			? R.partial(this.onChange, [arg])
			: null;

		return <div>
			<table><tbody>
			<tr>
				<td>
					<label>KB Type: </label>
				</td>
				<td>
					<select
						className='form-control'
						name='type'
						key='type'
						value={selectedItem.type}
						onChange={onChange}
					>
						<option value=''>— select —</option>
						{options.map(item => <option key={item.type} value={item.type}>{item.label}</option>)}
					</select>
				</td>
			</tr>
			{(attributes || [])
				.map((attr) => {
					return <tr key={attr.id}>
						<td><label>{attr.label}:</label> </td>
						<td>
						{(!!attr.values)
							? <select
								className='form-control'
								onChange={onChange}
								name={attr.id}
								value={selectedItem[attr.id]}
								key={`${attr.id}-values`}
							>
								<option value=''>— select —</option>
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
							: <input
								className='form-control'
								type='text'
								onChange={onChange}
								name={attr.id}
								readOnly={(attr.id === 'tkb:name')}
								value={(attr.id === 'tkb:name' || attr.id === 'tkb:actor_name')
									? selectedItem.label
									: selectedItem[attr.id]
								}
							/>
						}
						</td>
					</tr>;
				})
			}
			</tbody></table>
		</div>;
	},
});


module.exports = PropertiesPanel;

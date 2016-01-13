'use strict';

let $ = require('jquery');
let React = require('react');
let R = require('ramda');
let helpers = require('./helpers.js');
let modelHelpers = require('./model-helpers.js');
let actionCreators = require('./actionCreators.js');
const constants = require('./constants.js');


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

		// if (!!component.relation) { // it's an edge
		// 	// TODO: handle this elsewhere
		// 	newProperties.directed =
		// 		(R.contains(component.relation, ['network', 'connects']))
		// 			? false
		// 			: true;
		// }

		const props = this.props;
		props.dispatch(
			actionCreators.updateComponentProperties(
				selected.componentId,
				selected.componentType,
				newProperties
			)
		);
	},

	onSubmit: function(event) {
		event.preventDefault();
	},

	renderTypeOptions: function() {
		return R.without(['edges'], modelHelpers.modelComponents)
			.map(function(type) {
				return <option key={type} value={type}>{type}</option>;
			});
	},

	renderProperties: function(selectedItem, componentType) {
		const props = this.props;

		if (!selectedItem) {
			return null;
		}

		const onChange = (props.selected)
			? R.partial(this.onChange, [props.selected])
			: null;

		switch (props.selected.componentType) {

			case 'node':
				const node = selectedItem;
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
										name='type'
										className='form-control'
										value={node.type}>
										{this.renderTypeOptions()}
									</select>
								</td>
							</tr>
							<tr>
								<td><label>groups:</label></td>
								<td><span>TODO</span></td>
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
							<tr>
								<td><label>children:</label></td>
								<td><span>TODO</span></td>
							</tr>
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
									<select name='relation' value={edge.relation||null}>
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
		const props = this.props;

		let selectedItem;
		let componentType;
		let componentId;

		if (props.selected) {
			componentType = props.selected.componentType;
			componentId = props.selected.componentId;

			let list = {
				'node': props.graph.nodes,
				'edge': props.graph.edges,
				'group': props.graph.groups,
			}[componentType] || [];
			selectedItem = helpers.getItemById(list, componentId);
		}

		const selectedType = (selectedItem)
			? componentType || '(unknown type)'
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
								: this.renderProperties(selectedItem, componentType)
							}
						</span>
					</div>
				</form>
			</div>
		);
	},

	componentWillMount: function() {
		let that = this;

		// TODO: use flux pattern for this?
		$.ajax({
			url: this.props.relationsLibUrl,
			dataType: 'json',
		}).success(function(data) {
			that.setState({ relationsLib: data.list });
		});
	},

	getInitialState: function() {
		return {
			relationsLib: []
		};
	}

});


module.exports = PropertiesPanel;

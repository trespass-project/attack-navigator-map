'use strict';

let $ = require('jquery');
let React = require('react');
let R = require('ramda');
let helpers = require('./helpers.js');
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

	_onChange: function(data, event) {
		data[event.target.name] = event.target.value;

		if (!!data.relation) { // it's an edge
			// TODO: handle this elsewhere
			data.directed = (R.contains(data.relation, ['network', 'connects'])) ? false : true;
		}

		// TODO: action → update item
	},

	_onSubmit: function(event) {
		event.preventDefault();
	},

	renderTypeOptions: function() {
		return [
			'location',
			// 'edge',
			'asset',
			'actor',
			'role',
			'predicate',
			'process',
			'policy'
			].map(function(type) {
				return <option key={type} value={type}>{type}</option>;
			});
	},

	renderProperties: function() {
		const props = this.props;

		if (!props.selected || !props.selected.it) { return null; }

		switch (props.selected.type) {

			case 'node':
				const node = props.selected.it;
				return (
					<table>
						<tbody>
							<tr>
								<td><label>label:</label></td>
								<td>
									<input type='text' className='form-control' name='label' placeholder='label' value={node.label || ''} />
								</td>
							</tr>
							<tr>
								<td><label>id:</label></td>
								<td><span>{node.id}</span></td>
							</tr>
							<tr>
								<td><label>type:</label></td>
								<td>
									<select name='type' className='form-control' value={node.type}>
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
				const group = props.selected.it;
				return (
					<table>
						<tbody>
							<tr>
								<td><label>name:</label></td>
								<td><input type='text' className='form-control' name='name' placeholder='name' value={group.name || ''} /></td>
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
				const edge = props.selected.it;

				// look up actual nodes by id
				// TODO: DRY — make a utility function for this
				const edgeNodes = {
					fromNode: helpers.getItemById(props.graph.nodes, edge.from),
					toNode: helpers.getItemById(props.graph.nodes, edge.to),
				};

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

		const onChange = (props.selected)
			? R.partial(this._onChange, [props.selected.it])
			: null;

		const selectedItem = (props.selected && props.selected.it)
			? props.selected.it : null;
		const selectedType = (selectedItem)
			? props.selected.type || 'unknown type'
			: '';

		return (
			<div id={props.id} className='panel-section'>
				<h3 className='title'>
					selection{(selectedItem) ? ': '+selectedType : ''}
				</h3>
				<form className='form' onSubmit={this._onSubmit}>{/* form-horizontal */}
					<div className='form-group' onChange={onChange}>
						<span className='disabled'>
							{(!selectedItem)
								? 'nothing selected'
								: this.renderProperties()
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

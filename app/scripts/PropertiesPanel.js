'use strict';

var $ = require('jquery');
var React = require('react');
var _ = require('lodash');
var R = require('ramda');
var helpers = require('./helpers.js');
var constants = require('./constants.js');


var ContextMenu = React.createClass({
	mixins: [],

	propTypes: {
		relationsLibUrl: React.PropTypes.string.isRequired,
	},

	getDefaultProps: function() {
		return {
			//
		};
	},

	_onChange: function(data, event) {
		data[event.target.name] = event.target.value;

		// TODO:
		if (!!data.relation) { // it's an edge
			data.directed = (R.contains(data.relation, ['network', 'connects'])) ? false : true;
		}

		// TODO: less hacky?
		this.props.flux.getStore(constants.GRAPH)
			._updateModel(this.props.graph);
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

	renderProperties: function(args) {
		var props = this.props;
		if (!props.selected) { return null; }

		switch (props.selected.type) {

			case 'node':
				let node = props.selected.it;
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
				let group = props.selected.it;
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
											return <option value={relation.value}>{relation.label}</option>;
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
		var that = this;
		var props = this.props;

		var onChange = null;
		if (props.selected) {
			onChange = _.partial(this._onChange, props.selected.it);
		}

		return (
			<div id={props.id} className='panel-section'>
				<h3 className='title'>
					selection{(props.selected) ? ': '+props.selected.type : ''}
				</h3>
				<form className='form' onSubmit={this._onSubmit}>{/* form-horizontal */}
					<div className='form-group' onChange={onChange}>
						<span className='disabled'>{(!props.selected) ? 'nothing selected' : ''}</span>
						{this.renderProperties()}
					</div>
				</form>
			</div>
		);
	},

	componentWillMount: function() {
		const that = this;

		// TODO: use flux pattern for this
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


module.exports = ContextMenu;

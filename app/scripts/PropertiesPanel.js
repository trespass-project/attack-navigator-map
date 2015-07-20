'use strict';

var React = require('react');
var _ = require('lodash');
var helpers = require('./helpers.js');


var ContextMenu = React.createClass({
	mixins: [],

	propTypes: {
		// theme: React.PropTypes.object.isRequired,
		// contextMenu: React.PropTypes.any.isRequired,
	},

	getDefaultProps: function() {
		return {

		};
	},

	_onChange: function(data, event) {
		data[event.target.name] = event.target.value;
		// TODO: less hacky?
		this.props.flux.getStore('graph')._updateGraph(this.props.graph);
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
					<div onChange={_.partial(this._onChange, node)}>
						<div>label: <input type='text' name='label' placeholder='label' value={node.label || ''} /></div>
						<div>id: {node.id}</div>
						<div>type: <select name='type' value={node.type}>
								{this.renderTypeOptions()}
							</select>
						</div>
						<div>groups: TODO</div>
					</div>
				);

			case 'group':
				let group = props.selected.it;
				return (
					<div onChange={_.partial(this._onChange, group)}>
						<div>name: <input type='text' name='name' placeholder='name' value={group.name || ''} /></div>
						<div>id: {group.id}</div>
						<div>bg image: {(group._bgImage) ? group._bgImage.url : '—'}</div>
						<div>children: TODO</div>
					</div>
				);

			case 'edge':
				let edge = props.selected.it;
				return (
					<div onChange={_.partial(this._onChange, edge)}>
						<div>from: {edge.from.label}</div>
						<div>to: {edge.to.label}</div>
						<div>relation: <input type='text' name='relation' placeholder='relation' value={edge.relation || ''} /></div>
					</div>
				);

			default:
				return <div>unknown</div>;
		}
	},

	render: function() {
		var that = this;
		var props = this.props;

		return (
			<div id={props.id}>
				<b>{(!props.selected) ? 'nothing selected' : props.selected.type}</b>
				<br/>
				<br/>
				{this.renderProperties()}
			</div>
		);
	},

});


module.exports = ContextMenu;

'use strict';

let R = require('ramda');
let React = require('react');
let actionCreators = require('../../actionCreators.js');
const constants = require('../../constants.js');
let Library = require('../Library/Library.js');



let ModelLibrary = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	loadModel: function(item) {
		this.props.dispatch( actionCreators.loadModel(item.filename) );
	},

	renderItem: function(item, index) {
		let onClick = R.partial(this.loadModel, [item]);
		return (
			<li onClick={onClick} key={item.id || index}>
				<b>{item.name}</b>
			</li>
		);
	},

	render: function() {
		const props = this.props;
		return (
			<div>
				<Library
					onClick={this.loadModel}
					renderItem={this.renderItem}
					{...props}>
				</Library>
			</div>
		);
	},
});


module.exports = ModelLibrary;

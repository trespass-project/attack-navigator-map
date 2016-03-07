'use strict';

let R = require('ramda');
let React = require('react');
let actionCreators = require('../../actionCreators.js');
let Library = require('../Library/Library.js');



let ModelLibrary = React.createClass({
	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	propTypes: {
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	loadModel: function(item) {
		this.context.dispatch( actionCreators.loadModel(item.filename) );
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

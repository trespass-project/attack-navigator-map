'use strict';

const R = require('ramda');
const React = require('react');
const actionCreators = require('../../actionCreators.js');
const Library = require('../Library/Library.js');


const ModelLibrary = React.createClass({

	contextTypes: {
		// theme: React.PropTypes.object,
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
		const onClick = R.partial(this.loadModel, [item]);
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

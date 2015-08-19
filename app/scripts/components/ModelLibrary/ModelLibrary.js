'use strict';

var _ = require('lodash');
var React = require('react');
var utils = require('../../utils.js');
var constants = require('../../constants.js');
var Library = require('../Library/Library.js');


class ModelLibrary extends React.Component {

	constructor(props) {
		super(props);
		utils.autoBind(this);
	}

	loadModel(item) {
		var flux = this.props.flux;
		var graphActions = flux.getActions(constants.GRAPH);
		graphActions.loadModel(item.filename);
	}

	renderItem(item, index) {
		var onClick = _.partial(this.loadModel, item);
		return (
			<li
			onClick={onClick}
			key={item.id || index}
			>
				<b>{item.name}</b>
			</li>
		);
	}

	render() {
		var that = this;
		var list = this.props.list;

		return (
			<div>
				<Library
					onClick={this.loadModel}
					renderItem={this.renderItem}
					{...this.props}>
				</Library>
			</div>
		);
	}
}


module.exports = ModelLibrary;

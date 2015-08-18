'use strict';

var $ = require('jquery');
var _ = require('lodash');
var React = require('react');
var DropTarget = require('react-dnd').DropTarget;

var utils = require('../../utils.js');
var constants = require('../../constants.js');


class ModelDebugView extends React.Component {

	constructor(props) {
		super(props);
		utils.autoBind(this);
	}

	render() {
		var that = this;
		var model = this.props.model;
		if (!model) { return null; }

		const connectDropTarget = this.props.connectDropTarget;
		return connectDropTarget(
			<pre className='debug-json'>
				{JSON.stringify(model, null, 2)}
			</pre>
		);
	}
}


ModelDebugView.propTypes = {
	model: React.PropTypes.object,

	isOver: React.PropTypes.bool.isRequired,
	connectDropTarget: React.PropTypes.func.isRequired
};


var spec = {
	drop: function (props, monitor, component) {
		let data = monitor.getItem().data;
		// console.log(data);
		return { target: constants.DND_TARGET_DEBUG };
	}
};


// the props to be injected
function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
}


module.exports = DropTarget(['LibraryItem'], spec, collect)(ModelDebugView);

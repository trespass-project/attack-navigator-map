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
			<div>
				<input ref='load-model' type='file' accept='.xml' onChange={this.loadXMLFile} />
				<hr/>
				<button onClick={this.generateXML} className='btn btn-default btn-xs'>save as XML</button>
				<br/><br/>
				<pre className='debug-json'>
					{JSON.stringify(model, null, 2)}
				</pre>
			</div>
		);
	}

	loadXMLFile(event) {
		event.preventDefault();
		let that = this;

		let $fileInput = $(this.refs['load-model'].getDOMNode());
		let file = $fileInput[0].files[0];

		var reader = new FileReader();
		reader.onload = function(event) {
			var content = event.target.result;
			that.context.graphActions.loadXML(content);
		};
		reader.readAsText(file);
	}

	generateXML(event) {
		event.preventDefault();
		this.context.graphActions.generateXML();
	}
}


ModelDebugView.propTypes = {
	model: React.PropTypes.object,

	isOver: React.PropTypes.bool.isRequired,
	connectDropTarget: React.PropTypes.func.isRequired
};


ModelDebugView.contextTypes = {
	graphActions: React.PropTypes.object,
	interfaceActions: React.PropTypes.object
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

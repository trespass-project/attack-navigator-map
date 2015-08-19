'use strict';

var React = require('react');
var DragSource = require('react-dnd').DragSource;
var helpers = require('./helpers.js');
var constants = require('./constants.js');


var MainMenu = React.createClass({
	mixins: [],

	propTypes: {

	},

	getDefaultProps: function() {
		return {

		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	render: function() {
		var props = this.props;

		return (
			<div id={props.id}>
				<button onClick={this._toggleImages}>{(props.showImages) ? 'hide' : 'show'} images</button>
				<button onClick={this._toggleGroups}>{(props.showGroups) ? 'hide' : 'show'} groups</button>
				<button onClick={this._toggleEdges}>{(props.showEdges) ? 'hide' : 'show'} edges</button>
				<button onClick={this._resetTransformation}>reset transformation</button>
				<button onClick={this._autoLayout}>auto-layout</button>
			</div>
		);
	},

	_toggleImages: function(event) {
		this.context.interfaceActions.setShowImages(!this.props.showImages);
	},

	_toggleGroups: function(event) {
		this.context.interfaceActions.setShowGroups(!this.props.showGroups);
	},

	_toggleEdges: function(event) {
		this.context.interfaceActions.setShowEdges(!this.props.showEdges);
	},

	_resetTransformation: function(event) {
		this.context.interfaceActions.setTransformation({
			scale: 1,
			panX: 0,
			panY: 0
		});
	},

	_autoLayout: function() {
		this.context.interfaceActions._autoLayout();
	}

});


module.exports = MainMenu;

'use strict';

var _ = require('lodash');
var React = require('react');
var mout = require('mout');
var helpers = require('./helpers.js');


var HTMLOverlay = React.createClass({
	mixins: [],

	propTypes: {

	},

	getDefaultProps: function() {
		return {

		};
	},

	_groupHoverOptions: function() {
		var props = this.props;

		if (!props.hoverGroup) { return null; }

		// TODO: DRY
		var bounds = helpers.getGroupBBox(props.graph.nodes, props.hoverGroup);
		bounds.minX -= props.theme.node.size*0.5;
		bounds.minY -= props.theme.node.size*0.5;
		bounds.maxX += props.theme.node.size*0.5;
		bounds.maxY += props.theme.node.size*0.5;
		console.log(bounds);
		var style = {
			position: 'absolute',
			top: bounds.minY,
			left: bounds.minX,
		};

		return (
			<div id='group-options' style={style}>
				<button>hello</button>
			</div>
		);
	},

	render: function() {
		var props = this.props;

		return (
			<div>
				{/*this._groupHoverOptions()*/}
			</div>
		);
	},

	componentWillMount: function() {
		//
	},

	componentDidMount: function() {
		//
	},

	componentWillReceiveProps: function() {
		//
	},

	componentWillUnmount: function() {
		//
	}

});


module.exports = HTMLOverlay;

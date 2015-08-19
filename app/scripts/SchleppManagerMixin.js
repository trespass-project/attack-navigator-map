'use strict';

var $ = require('jquery');
var React = require('react');
var helpers = require('./helpers.js');


var SchleppManagerMixin = {
	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	componentDidMount: function() {
		var that = this;

		var elem = helpers.getElemByRef(this, 'dragRoot');
		var $elem = $(elem);

		$elem.on('mousemove', function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (that.props.drag) {
				(that.props.drag.onMove || helpers.noop)(event);
			}
		});

		$elem.on('mouseup', function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (that.props.drag) {
				(that.props.drag.onEnd || helpers.noop)(event);
			}
			that.context.interfaceActions.setDrag(null);
		});
	},

	componentWillUnmount: function() {
		var elem = helpers.getElemByRef(this, 'dragRoot');
		var $elem = $(elem);
		$elem
			.off('mousedown')
			.off('mousemove')
			.off('mouseup');
	}
};

module.exports = SchleppManagerMixin;

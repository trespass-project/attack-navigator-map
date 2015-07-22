'use strict';

var $ = require('jquery');
var helpers = require('./helpers.js');


var SchleppManagerMixin = {
	componentDidMount: function() {
		var that = this;

		var elem = helpers.getElem(this, 'dragRoot');
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
			that._interfaceActions.setDrag(null);
		});
	},

	componentWillUnmount: function() {
		var elem = helpers.getElem(this, 'dragRoot');
		var $elem = $(elem);
		$elem
			.off('mousedown')
			.off('mousemove')
			.off('mouseup');
	}
};

module.exports = SchleppManagerMixin;

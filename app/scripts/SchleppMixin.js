'use strict';

var $ = require('jquery');
var React = require('react');
var helpers = require('./helpers.js');


var SchleppMixin = {
	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	componentDidMount: function() {
		var that = this;

		var elem = helpers.getElemByRef(this, 'dragRoot');
		var $elem = $(elem);

		var lastX, lastY;

		$elem.on('mousedown', function(event) {
			event.preventDefault();
			event.stopPropagation();

			lastX = event.offsetX;
			lastY = event.offsetY;
			event.deltaX = 0;
			event.deltaY = 0;

			(that._onDragStart || helpers.noop)(event);

			that.context.interfaceActions.setDrag({
				elem,
				onMove: function(event) {
					event.deltaX = event.offsetX - lastX;
					event.deltaY = event.offsetY - lastY;
					(that._onDragMove || helpers.noop)(event);
				},
				onEnd: function(event) {
					(that._onDragEnd || helpers.noop)(event);
				},
			});
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

module.exports = SchleppMixin;

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

		var $body = $('body');

		$body.on('keydown', function(event) {
			if (event.keyCode === 32) {
				if (that.props.mouseOverEditor) {
					event.preventDefault();
					event.stopPropagation();
					// console.log('space!');
				}

				that.context.interfaceActions.setSpacePressed(true);

				// pannable:
				if ($elem[0].tagName === 'svg') {
					that.context.interfaceActions.setPannable(true);
				}
			}
		});

		$body.on('keyup', function(event) {
			if (event.keyCode === 32) {
				that.context.interfaceActions.setSpacePressed(false);
				that.context.interfaceActions.setPannable(false);
			}
		});

		$elem.on('mousemove', function(event) {
			event.preventDefault();
			event.stopPropagation();

			that.context.interfaceActions.setMouseOverEditor(true);

			if (that.props.drag) {
				(that.props.drag.onMove || helpers.noop)(event);
			}
		});

		$elem.on('mouseleave', function(event) {
			event.preventDefault();
			event.stopPropagation();
			that.context.interfaceActions.setMouseOverEditor(false);
		});

		$elem.on('mouseup', function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (that.props.drag) {
				(that.props.drag.onEnd || helpers.noop)(event);
			}
			that.context.interfaceActions.setDrag(null);
			that.context.interfaceActions.setPanning(false);
		});
	},

	componentWillUnmount: function() {
		var elem = helpers.getElemByRef(this, 'dragRoot');
		var $elem = $(elem);

		var $body = $('body');

		$body
			.off('keydown')
			.off('keyup');

		$elem
			.off('mousedown')
			.off('mousemove')
			.off('mouseleave')
			.off('mouseup');
	}
};

module.exports = SchleppManagerMixin;

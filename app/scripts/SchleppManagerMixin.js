'use strict';

let $ = require('jquery');
let React = require('react');
let helpers = require('./helpers.js');


var SchleppManagerMixin = {
	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	componentDidMount: function() {
		const props = this.props;

		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);

		let $body = $('body');

		$body.on('keydown', function(event) {
			if (event.keyCode === 32) {
				if (that.props.mouseOverEditor) {
					event.preventDefault();
					event.stopPropagation();
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
		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);

		let $body = $('body');

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

'use strict';

const $ = require('jquery');
const React = require('react');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');


const SchleppMixin = {
	componentDidMount: function() {
		let that = this;

		const elem = helpers.getElemByRef(this, 'dragRoot');
		const $elem = $(elem);

		let lastX;
		let lastY;

		$elem.on('mousedown', function(event) {
			event.preventDefault();
			event.stopPropagation();

			// panning:
			// only when space is pressed and mouse is over editor
			// if ($elem[0].tagName === 'svg') {
			// 	let panning = that.props.mouseOverEditor && that.props.spacePressed;
			// 	if (!panning) {
			// 		return;
			// 	} else {
			// 		that.props.dispatch( actionCreators.setPanning(true) );
			// 	}
			// }

			lastX = event.clientX;
			lastY = event.clientY;
			event._deltaX = 0;
			event._deltaY = 0;

			(that._onDragStart || helpers.noop)(event);

			that.props.dispatch(
				actionCreators.setDrag({
					elem,
					onMove: function(event) {
						event._deltaX = event.clientX - lastX;
						event._deltaY = event.clientY - lastY;
						(that._onDragMove || helpers.noop)(event);
					},
					onEnd: function(event) {
						(that._onDragEnd || helpers.noop)(event);
					},
				})
			);
		});
	},

	componentWillUnmount: function() {
		const elem = helpers.getElemByRef(this, 'dragRoot');
		const $elem = $(elem);
		$elem
			.off('mousedown');
	}
};

module.exports = SchleppMixin;

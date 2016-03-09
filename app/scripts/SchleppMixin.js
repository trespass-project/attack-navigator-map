'use strict';

const $ = require('jquery');
const React = require('react');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');


const SchleppMixin = {
	componentDidMount: function() {
		const that = this;

		const elem = helpers.getElemByRef(this, 'dragRoot');
		const $elem = $(elem);

		let lastX;
		let lastY;

		$elem.on('mousedown', (event) => {
			event.preventDefault();
			event.stopPropagation();

			// panning:
			// only when space is pressed and mouse is over editor
			// if ($elem[0].tagName === 'svg') {
			// 	let panning = that.props.mouseOverEditor && that.props.spacePressed;
			// 	if (!panning) {
			// 		return;
			// 	} else {
			// 		that.context.dispatch( actionCreators.setPanning(true) );
			// 	}
			// }

			lastX = event.clientX;
			lastY = event.clientY;
			event._deltaX = 0;
			event._deltaY = 0;

			(that._onDragStart || helpers.noop)(event);

			that.context.dispatch(
				actionCreators.setDrag({
					elem,
					onMove: (event) => {
						event._deltaX = event.clientX - lastX;
						event._deltaY = event.clientY - lastY;
						(that._onDragMove || helpers.noop)(event);
					},
					onEnd: (event) => {
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

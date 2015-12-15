'use strict';

let $ = require('jquery');
let React = require('react');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


let SchleppMixin = {
	componentDidMount: function() {
		let that = this;
		const props = this.props;

		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);

		let lastX, lastY;

		$elem.on('mousedown', function(event) {
			event.preventDefault();
			event.stopPropagation();

			// panning:
			// only when space is pressed and mouse is over editor
			if ($elem[0].tagName === 'svg') {
				let panning = props.mouseOverEditor && props.spacePressed;
				if (!panning) {
					return;
				} else {
					props.dispatch( actionCreators.setPanning(true) );
				}
			}

			lastX = event.offsetX;
			lastY = event.offsetY;
			event.deltaX = 0;
			event.deltaY = 0;

			(that._onDragStart || helpers.noop)(event);

			props.dispatch(
				actionCreators.setDrag({
					elem,
					onMove: function(event) {
						event.deltaX = event.offsetX - lastX;
						event.deltaY = event.offsetY - lastY;
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
		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);
		$elem
			.off('mousedown')
			.off('mousemove')
			.off('mouseup');
	}
};

module.exports = SchleppMixin;

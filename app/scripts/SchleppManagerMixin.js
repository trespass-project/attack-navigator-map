'use strict';

let $ = require('jquery');
let _ = require('lodash');
let React = require('react');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


let SchleppManagerMixin = {
	componentDidMount: function() {
		let that = this;

		let $body = $('body');
		$body.on('keydown', function(event) {
			if (event.keyCode === 32) {
				if (that.props.mouseOverEditor) {
					event.preventDefault();
					event.stopPropagation();
				}

				that.props.dispatch( actionCreators.setSpacePressed(true) );

				// pannable:
				if ($elem[0].tagName === 'svg') {
					that.props.dispatch( actionCreators.setPannable(true) );
				}
			}
		});

		$body.on('keyup', function(event) {
			if (event.keyCode === 32) {
				that.props.dispatch( actionCreators.setSpacePressed(false) );
				that.props.dispatch( actionCreators.setPannable(false) );
			}
		});

		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);
		$elem.on('mousemove', function(event) {
			event.preventDefault();
			event.stopPropagation();

			that.props.dispatch( actionCreators.setMouseOverEditor(true) );

			if (that.props.drag) {
				(that.props.drag.onMove || helpers.noop)(event);
			}
		});

		$elem.on('mouseleave', function(event) {
			event.preventDefault();
			event.stopPropagation();
			that.props.dispatch( actionCreators.setMouseOverEditor(false) );
		});

		$elem.on('mouseup', function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (that.props.drag) {
				(that.props.drag.onEnd || helpers.noop)(event);
			}
			that.props.dispatch( actionCreators.setDrag(null) );
			that.props.dispatch( actionCreators.setPanning(false) );
		});
	},

	componentWillUnmount: function() {
		let $body = $('body');
		$body
			.off('keydown')
			.off('keyup');

		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);
		$elem
			.off('mousedown')
			.off('mousemove')
			.off('mouseleave')
			.off('mouseup');
	}
};

module.exports = SchleppManagerMixin;

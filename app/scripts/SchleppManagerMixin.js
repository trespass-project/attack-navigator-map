'use strict';

let $ = require('jquery');
let React = require('react');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


let SchleppManagerMixin = {
	componentDidMount: function() {
		let that = this;

		const $body = $('body'); // TODO: move this elsewhere
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
	},

	componentWillUnmount: function() {
		const $body = $('body');
		$body
			.off('keydown')
			.off('keyup');
	}
};

module.exports = SchleppManagerMixin;

'use strict';

const $ = require('jquery');
const React = require('react');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');


const SchleppManagerMixin = {
	componentDidMount: function() {
		const that = this;

		const elem = helpers.getElemByRef(this, 'dragRoot');
		const $elem = $(elem);

		const $body = $('body'); // TODO: move this elsewhere
		$body.on('keydown', (event) => {
			if (event.keyCode === 32) {
				if (that.props.mouseOverEditor) {
					event.preventDefault();
					event.stopPropagation();
				}

				that.context.dispatch( actionCreators.setSpacePressed(true) );

				// pannable:
				if ($elem[0].tagName === 'svg') {
					that.context.dispatch( actionCreators.setPannable(true) );
				}
			}
		});

		$body.on('keyup', (event) => {
			if (event.keyCode === 32) {
				that.context.dispatch( actionCreators.setSpacePressed(false) );
				that.context.dispatch( actionCreators.setPannable(false) );
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

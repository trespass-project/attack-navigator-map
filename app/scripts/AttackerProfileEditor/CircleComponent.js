'use strict';

const React = require('react');
const classnames = require('classnames');


const colorArray = ['#ffee56', '#ffb84d', '#ff5151', '#d60000', '#af0000', '#890000'];
const brighterArray = ['#fff177', '#ffc670', '#ff7373', '#de3232', '#bf3232', '#a03232'];
const classIdx = ['zero', 'one', 'two', 'three', 'four', 'five'];


// React module to represent an attacker profile for visualization
let CircleComponent = React.createClass({
	propTypes: {
		radius: React.PropTypes.number.isRequired,
		cx: React.PropTypes.string.isRequired,
		cy: React.PropTypes.string.isRequired,
		// cx: React.PropTypes.number.isRequired,
		// cy: React.PropTypes.number.isRequired,
		colorIdx: React.PropTypes.number.isRequired,
		type: React.PropTypes.string,
		setActiveHover: React.PropTypes.func,
	},

	render: function() {
		const props = this.props;

		const classes = classnames(
			'circleComponent',
			classIdx[props.colorIdx]
		);
		return (
			<circle
				cx={props.cx}
				cy={props.cy}
				r={props.radius}
				fill={colorArray[props.colorIdx]}
				stroke='lightgray'
				strokeWidth='0.5px'
				className={classes}
				onMouseEnter={this.mouseEnter}
				onMouseLeave={this.mouseLeave}
			/>
		);
	},

	mouseEnter: function() {
		const props = this.props;
		props.setActiveHover(props.type);
	},

	mouseLeave: function() {
		const props = this.props;
		props.setActiveHover(null);
	}

});

module.exports = CircleComponent;

'use strict';

const React = require('react');
const AttackerProfileComponent = require('./AttackerProfileComponent.js');
const AttackerToolTipComponent = require('./AttackerToolTipComponent.js');


// React module to represent an attacker profile for visualization
let AttackerProfile = React.createClass({
	propTypes: {
		attacker: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			attacker: {
				'title': 'Employee Reckless',
				'intent': 'non-hostile',
				'access': 'internal',
				'outcomes': [
					'damage',
					'embarrassment'
				],
				'limits': 'legal',
				'resources': 'individual',
				'skills': 'adept',
				'objectives': [
					'copy',
					'deny',
					'destroy',
					'damage',
					'take'
				],
				'visibility': 'covert'
			}
		};
	},

	getInitialState: function() {
		return {
			activeHover: null,
			over: false,
			mouseX: 0,
			mouseY: 0
		};
	},

	render: function() {
		const attacker = this.props.attacker;
		// console.log(this.state.activeHover);
		return <div
			id='attacker-profile'
			onMouseMove={this.mouseMove}
			onMouseLeave={this.mouseLeave}
		>
			{(this.state.over)
				? <AttackerToolTipComponent
					active={this.state.activeHover}
					profile={attacker}
					mouseX={this.state.mouseX}
					mouseY={this.state.mouseY} />
					: null
			}
			<AttackerProfileComponent
				attacker={attacker}
				setActiveHover={this.setActiveHover}
			/>
			<h5 className='attacker-desc'>
				{attacker.title}
			</h5>
		</div>;
	},

	setActiveHover: function(type) {
		this.setState({
			activeHover: type
		});
	},

	mouseMove: function(event) {
		this.setState({
			over: true,
			mouseX: event.pageX,
			mouseY: event.pageY
		});
	},

	mouseLeave: function() {
		this.setState({
			over: false
		});
	},

});

module.exports = AttackerProfile;

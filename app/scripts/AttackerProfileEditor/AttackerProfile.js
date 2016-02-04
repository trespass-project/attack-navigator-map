'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const $ = require('jquery');

const AttackerProfileComponent = require('./AttackerProfileComponent.js');
const AttackerToolTipComponent = require('./AttackerToolTipComponent.js');


// React module to represent an attacker profile for visualization
let AttackerProfile = React.createClass({
	propTypes: {
		attacker: React.PropTypes.object.isRequired,
		showToolTip: React.PropTypes.bool,
		displayLabel: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			showToolTip: false,
			displayLabel: false,
		};
	},

	getInitialState: function() {
		return {
			activeHover: null,
			over: false,
			mouseX: 0,
			mouseY: 0,
			width: 0,
		};
	},

	render: function() {
		let state = this.state;
		const props = this.props;
		const attacker = props.attacker;

		// console.log(this.state.activeHover);
		return <div
			className='attacker-profile'
			onMouseMove={this.mouseMove}
			onMouseLeave={this.mouseLeave}
			>
			{(state.over && props.showToolTip)
				? <AttackerToolTipComponent
					active={state.activeHover}
					profile={attacker}
					mouseX={state.mouseX}
					mouseY={state.mouseY}
				/>
				: null
			}
			<AttackerProfileComponent
				attacker={attacker}
				setActiveHover={this.setActiveHover}
				width={state.width}
			/>
			{(props.displayLabel)
				? <h5 className='attacker-desc'>
					{attacker.title}
				</h5>
				: null
			}
		</div>;
	},

	componentDidMount: function() {
		const elem = reactDOM.findDOMNode(this);
		this.setState({ width: $(elem).width() });
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

'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const $ = require('jquery');


let AttackerToolTipComponent = React.createClass({
	propTypes: {
		profile: React.PropTypes.object.isRequired,
		active: React.PropTypes.string,
		mouseX: React.PropTypes.number.isRequired,
		mouseY: React.PropTypes.number.isRequired,
		width: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			width: 400
		};
	},

	getInitialState: function() {
		return {
			mouseX: 0,
			mouseY: 0,
			height: 0,
		};
	},

	componentDidMount: function() {
		const elem = reactDOM.findDOMNode(this);
		this.setState({ height: $(elem).height() });
	},

	getStyle: function() {
		const props = this.props;
		const state = this.state;

		const windowWidth = $(window).width();
		const windowHeight = $(window).height();

		let style = {
			position: 'absolute',
			backgroundColor: 'white',
			borderStyle: 'solid',
			borderColor: 'black',
			padding: '2px 2px 2px 2px',
			width: props.width,
			zIndex: 99999,
		};

		// Check bounds to make sure tooltip will always render in viewport
		if (windowWidth - props.MouseX > props.width) {
			style.left = props.mouseX - 10;
		} else {
			style.left = props.mouseX - props.width-10;
		}

		if (windowHeight - props.MouseY > state.height) {
			style.top = props.mouseY + 10;
		} else {
			style.top = props.mouseY - state.height-10;
		}

		return style;
	},

	render: function() {
		const props = this.props;

		const attacker = props.profile;
		const style = this.getStyle();

		let styleAttr = {
			resources: {},
			limit: {},
			visibility: {},
			skill: {},
			intentaccess: {},
		};

		if (props.active) {
			switch (props.active) {
				case 'intent':
					styleAttr.intentaccess = { fontWeight: 'bold' };
					break;
				case 'skill':
					styleAttr.skill = { fontWeight: 'bold' };
					break;
				case 'visibility':
					styleAttr.visibility = { fontWeight: 'bold' };
					break;
				case 'limit':
					styleAttr.limit = { fontWeight: 'bold' };
					break;
				case 'resources':
					styleAttr.resources = { fontWeight: 'bold' };
					break;
				default:
					break;
			}
		}

		return (
			<div className='attacker-tooltip' style={style}>
				<b>{attacker.title}</b>
				<br />
				<p id='objective'>
					Objective: {(attacker.objectives || []).join(', ')}</p>
				<p id='outcome'>
					Outcome: {(attacker.outcomes || []).join(', ')}
				</p>
				<br />
				<p id='resources' style={styleAttr.resources}>
					Resources: {attacker.resources}
				</p>
				<p id='limit' style={styleAttr.limit}>
					Limit: {attacker.limit}
				</p>
				<p id='visibility' style={styleAttr.visibility}>
					Visibility: {attacker.visibility}
				</p>
				<p id='skill' style={styleAttr.skill}>
					Skill: {attacker.skills}
				</p>
				<p id='intentaccess' style={styleAttr.intentaccess}>
					Intent/Access: {attacker.intent} {attacker.access}
				</p>
			</div>
		);
	},
});

module.exports = AttackerToolTipComponent;

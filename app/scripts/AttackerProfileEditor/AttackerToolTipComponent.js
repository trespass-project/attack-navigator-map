'use strict';

const React = require('react');


let AttackerToolTipComponent = React.createClass({
	propTypes: {
		profile: React.PropTypes.object.isRequired,
		active: React.PropTypes.string,
		mouseX: React.PropTypes.number.isRequired,
		mouseY: React.PropTypes.number.isRequired,
	},

	getInitialState : function() {
		return {
			mouseX: 0,
			mouseY: 0
		};
	},

	render: function() {
		const props = this.props;

		const attacker = props.profile;
		const style = {
			position: 'absolute',
			backgroundColor: 'white',
			borderStyle: 'solid',
			borderColor: 'black',
			left: props.mouseX - 10,
			top: props.mouseY + 10,
		};

		let styleAttr = {
			resources: {},
			limits: {},
			visibility: {},
			skill: {},
			intentaccess: {},
		}
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
				case 'limits':
					styleAttr.limits = { fontWeight: 'bold' };
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
				<p id='limits' style={styleAttr.limits}>
					Limits: {attacker.limits}
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

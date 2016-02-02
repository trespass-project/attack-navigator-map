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
        return ({mouseX: 0, mouseY: 0});
    },

    render: function() {
        let attacker = this.props.profile;
        let style = {
                position: 'absolute',
                backgroundColor: 'white',
                borderStyle: 'solid',
                borderColor: 'black',
                left: this.props.mouseX-10,
                top: this.props.mouseY+10,
        };

        let styleAttr = {
            resources: {},
            limits: {},
            visibility: {},
            skill: {},
            intentaccess: {},
        }
        if (this.props.active)
            switch (this.props.active) {
                case "intent":
                    styleAttr.intentaccess = {fontWeight: 'bold'};
                    break;
                case "skill":
                    styleAttr.skill = {fontWeight: 'bold'};
                    break;
                case "visibility":
                    styleAttr.visibility = {fontWeight: 'bold'};
                    break;
                case "limits":
                    styleAttr.limits = {fontWeight: 'bold'};
                    break;
                case "resources":
                    styleAttr.resources = {fontWeight: 'bold'};
                    break;
                default:
                    break;

            }

        return (<div className="attacker-tooltip" style={style}>
        <b>{attacker.title}</b><br />
        <p id='objective'>Objective: {this.getObjectiveString()}</p>
        <p id='outcome'>Outcome: {this.getOutcomeString()}</p><br />
        <p id='resources' style={styleAttr.resources}>Resources: {attacker.resources}</p>
        <p id='limits' style={styleAttr.limits}>Limits: {attacker.limits}</p>
        <p id='visibility' style={styleAttr.visibility}>Visibility: {attacker.visibility}</p>
        <p id='skill' style={styleAttr.skill}>Skill: {attacker.skills}</p>
        <p id='intentaccess' style={styleAttr.intentaccess}>Intent/Access: {attacker.intent} {attacker.access}</p>
        </div>
        );
    },

    getObjectiveString: function() {
        let attacker = this.props.profile;
        let output = "";

        for (let i = 0; i < attacker.objectives.length; i++)
            output += attacker.objectives[i] + " ";

        return output;
    },

    getOutcomeString: function() {
        let attacker = this.props.profile;
        let output = "";

        for (let i = 0; i < attacker.outcomes.length; i++)
            output += attacker.outcomes[i] + " ";

        return output;
    }
});

module.exports = AttackerToolTipComponent;

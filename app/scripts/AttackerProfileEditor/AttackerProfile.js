'use strict';

const React = require('react');
const AttackerProfileComponent = require("./AttackerProfileComponent.js");

// React module to represent an attacker profile for visualization using d3
let AttackerProfile = React.createClass({
    propTypes: {
        attacker: React.PropTypes.object.isRequired,
    },

    getDefaultProps: function() {
        return {
            attacker: {
                title: "Employee Reckless",
                intent: "Non-Hostile",
                access: "Internal",
                outcome: [
                    "Damage",
                    "Embarrassment"
                ],
                limits: "Legal",
                resources: "Individual",
                skills: "Adept",
                objective: [
                    "All of the Above"
                ],
                visibility: "Covert"
            }
        };
    },

    render: function() {
        let attacker = this.props.attacker;

        return (<div id="attacker-profile">
            <AttackerProfileComponent attacker={attacker} />
        <p>{attacker.title}</p>
        </div>);
    }

});

module.exports = AttackerProfile;

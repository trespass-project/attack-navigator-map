'use strict';

const React = require('react');
const AttackerProfileComponent = require("./AttackerProfileComponent.js");
const AttackerToolTipComponent = require("./AttackerToolTipComponent.js");

// React module to represent an attacker profile for visualization
let AttackerProfile = React.createClass({
    propTypes: {
        attacker: React.PropTypes.object.isRequired,
    },

    getDefaultProps: function() {
        return {
            attacker: {
                "title": "Employee Reckless",
		"intent": "non-hostile",
		"access": "internal",
		"outcomes": [
			"damage",
			"embarrassment"
		],
		"limits": "legal",
		"resources": "individual",
		"skills": "adept",
		"objectives": [
			"copy", "deny", "destroy", "damage", "take"
		],
		"visibility": "covert"
            }
        };
    },

    getInitialState: function() {
        return {activeHover: null}
    },

    render: function() {
        let attacker = this.props.attacker;
        console.log(this.state.activeHover);
        return (<div id="attacker-profile">
            {this.state.activeHover ? <AttackerToolTipComponent active={this.state.activeHover} profile={attacker} /> : null}
            <AttackerProfileComponent attacker={attacker} setActiveHover={this.setActiveHover}/>
        <h5 className="attacker-desc">{attacker.title}</h5>
        </div>);
    },

    setActiveHover: function(type) {
        this.setState({activeHover: type});
    },

});

module.exports = AttackerProfile;

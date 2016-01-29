'use strict';

const React = require('react');
const d3 = require('d3');
const $ = require('jquery');
const CircleComponent = require('./CircleComponent.js');

let resourcesArray = ["Individual", "Club", "Contest", "Team", "Organization", "Government"];
let skillsArray = ["None", "Minimal", "Operational", "Adept"];
let limitsArray = ["Code of Conduct", "Legal", "Extra-legal, minor", "Extra-legal, major"];
let visibilityArray = ["Overt", "Covert", "Clandestine", "Multiple"];
let intentAccessArray = ["External Non-Hostile", "Internal Non-Hostile", "External Hostile", "Internal Hostile"];
let colorArray = ["#ffee56", "#ffb84d", "#ff5151", "#d60000", "#af0000", "#890000"];
let brighterArray = ["#fff177", "#ffc670", "#ff7373", "#de3232", "#bf3232", "#a03232"];

// React module to represent an attacker profile for visualization using d3
let AttackerProfileComponent = React.createClass({
    propTypes: {
        attacker: React.PropTypes.object.isRequired,
    },

    render: function() {
        let attacker = this.props.attacker;
        this.computeDistances(attacker);

        let width = 150;
        let height = 150;

        let cx = width/2, cy = height/2;

        return (
        <svg className="attacker-profile-component" width={width} height={height}>
            <g className="profile-dots">
                <CircleComponent radius={attacker.intentR} colorIdx={attacker.intentIdx} cx={cx} cy={cy} className="intentCircle"/>
                <CircleComponent radius={attacker.skillR} colorIdx={attacker.skillIdx} cx={cx} cy={cy} className="skillCircle"/>
                <CircleComponent radius={attacker.visibilityR} colorIdx={attacker.visibilityIdx} cx={cx} cy={cy} className="visibilityCircle"/>
                <CircleComponent radius={attacker.limitsR} colorIdx={attacker.limitsIdx} cx={cx} cy={cy} className="limitsCircle"/>
                <CircleComponent radius={attacker.resourcesR} colorIdx={attacker.resourcesIdx} cx={cx} cy={cy} className="resourcesCircle"/>
            </g>
        </svg>);
    },

    computeDistances: function(attacker) {
            attacker.limitsIdx = limitsArray.indexOf(attacker.limits);
            attacker.visibilityIdx = visibilityArray.indexOf(attacker.visibility);
            attacker.skillIdx = skillsArray.indexOf(attacker.skills);
            attacker.intentIdx = intentAccessArray.indexOf(attacker.access + " " + attacker.intent);
            attacker.resourcesIdx = resourcesArray.indexOf(attacker.resources);


            var multipler = 3;

            attacker.resourcesR = (attacker.resourcesIdx + 1) * multipler;
            attacker.limitsR = attacker.resourcesR + (attacker.limitsIdx + 1) * multipler;
            attacker.visibilityR = attacker.limitsR + (attacker.visibilityIdx + 1) * multipler;
            attacker.skillR = attacker.visibilityR + (attacker.skillIdx + 1) * multipler;
            attacker.intentR = attacker.skillR + (attacker.intentIdx + 1) * multipler;
    }

});

module.exports = AttackerProfileComponent;

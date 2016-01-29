'use strict';

const React = require('react');

// React module to represent an attacker profile for visualization using d3
let CircleComponent = React.createClass({
    propTypes: {
        radius: React.PropTypes.number.isRequired,
        cx: React.PropTypes.number.isRequired,
        cy: React.PropTypes.number.isRequired,
        colorIdx: React.PropTypes.number.isRequired,
    },

    render: function() {
        let colorArray = ["#ffee56", "#ffb84d", "#ff5151", "#d60000", "#af0000", "#890000"];
        let brighterArray = ["#fff177", "#ffc670", "#ff7373", "#de3232", "#bf3232", "#a03232"];
        let classIdx = ["zero","one","two","three","four","five"]
        let props = this.props;

        let classes = "circleComponent " + classIdx[props.colorIdx];
        return (
            <circle cx={props.cx} cy={props.cy} r={props.radius} fill={colorArray[props.colorIdx]} stroke="lightgray" strokeWidth="0.5px" className={classes}/>
        );
    }

});

module.exports = CircleComponent;

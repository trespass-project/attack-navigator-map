'use strict';

const React = require('react');
const CircleComponent = require('./CircleComponent.js');


const resourcesArray = ['individual', 'club', 'contest', 'team', 'organization', 'government'];
const skillsArray = ['none', 'minimal', 'operational', 'adept'];
const limitsArray = ['code of conduct', 'legal', 'extra-legal, minor', 'extra-legal, major'];
const visibilityArray = ['overt', 'covert', 'clandestine', 'multiple'];
const intentAccessArray = ['external non-hostile', 'internal non-hostile', 'external hostile', 'internal hostile'];
const colorArray = ['#ffee56', '#ffb84d', '#ff5151', '#d60000', '#af0000', '#890000'];
const brighterArray = ['#fff177', '#ffc670', '#ff7373', '#de3232', '#bf3232', '#a03232'];


// React module to represent an attacker profile for visualization
let AttackerProfileComponent = React.createClass({
	propTypes: {
		attacker: React.PropTypes.object.isRequired,
		setActiveHover: React.PropTypes.func.isRequired,
	},

	render: function() {
		const attacker = this.props.attacker;
		this.computeDistances(attacker);

		const width = 150;
		const height = 150;
		const cx = width / 2
		const cy = height / 2;

		return (
			<svg
				className='attacker-profile-component'
				width={width}
				height={height}
			>
				<g className='profile-dots'>
					<CircleComponent
						radius={attacker.intentR}
						colorIdx={attacker.intentIdx}
						cx={cx}
						cy={cy}
						className='intentCircle'
						type='intent'
						setActiveHover={this.props.setActiveHover}
					/>
					<CircleComponent
						radius={attacker.skillR}
						colorIdx={attacker.skillIdx}
						cx={cx}
						cy={cy}
						className='skillCircle'
						type='skill'
						setActiveHover={this.props.setActiveHover}
					/>
					<CircleComponent
						radius={attacker.visibilityR}
						colorIdx={attacker.visibilityIdx}
						cx={cx}
						cy={cy} className='visibilityCircle'
						type='visibility'
						setActiveHover={this.props.setActiveHover}
					/>
					<CircleComponent
						radius={attacker.limitsR}
						colorIdx={attacker.limitsIdx}
						cx={cx}
						cy={cy} className='limitsCircle'
						type='limits'
						setActiveHover={this.props.setActiveHover}
					/>
					<CircleComponent
						radius={attacker.resourcesR}
						colorIdx={attacker.resourcesIdx}
						cx={cx}
						cy={cy} className='resourcesCircle'
						type='resources'
						setActiveHover={this.props.setActiveHover}
					/>
				</g>
			</svg>
		);
	},

	computeDistances: function(attacker) {
		attacker.limitsIdx = limitsArray.indexOf(attacker.limits);
		attacker.visibilityIdx = visibilityArray.indexOf(attacker.visibility);
		attacker.skillIdx = skillsArray.indexOf(attacker.skills);
		attacker.intentIdx = intentAccessArray.indexOf(attacker.access + ' ' + attacker.intent);
		attacker.resourcesIdx = resourcesArray.indexOf(attacker.resources);

		const multipler = 3;

		attacker.resourcesR = (attacker.resourcesIdx + 1) * multipler;
		attacker.limitsR = attacker.resourcesR + (attacker.limitsIdx + 1) * multipler;
		attacker.visibilityR = attacker.limitsR + (attacker.visibilityIdx + 1) * multipler;
		attacker.skillR = attacker.visibilityR + (attacker.skillIdx + 1) * multipler;
		attacker.intentR = attacker.skillR + (attacker.intentIdx + 1) * multipler;
	}

});

module.exports = AttackerProfileComponent;

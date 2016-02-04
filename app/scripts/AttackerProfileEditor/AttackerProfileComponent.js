'use strict';

const React = require('react');
const R = require('ramda');

const CircleComponent = require('./CircleComponent.js');
const attackerProfiles = require('../../data/attacker-profiles.js');
const profileValues = attackerProfiles.values;

// TODO: this shouldn't depend on the order, at all!
const resourcesArray = profileValues.resources;
const skillArray = profileValues.skill;
const limitArray = profileValues.limit;
const visibilityArray = profileValues.visibility;
const accessArray = profileValues.access;
const intentArray = profileValues.intent;
// const outcomesArray = profileValues.outcomes;
// const objectivesArray = profileValues.objectives;
const accessIntentArray = R.xprod(accessArray, intentArray)
	.map((list) => {
		return list.join(' ');
	});


// React module to represent an attacker profile for visualization
let AttackerProfileComponent = React.createClass({
	propTypes: {
		profile: React.PropTypes.object/*.isRequired*/,
		setActiveHover: React.PropTypes.func.isRequired,
		width: React.PropTypes.number,
		height: React.PropTypes.number,
		multiplier: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return ({
			width: (66*2),
			height: (66*2),
			multiplier: 3.0,
		});
	},

	render: function() {
		const props = this.props;

		const cx = '50%';
		const cy = '50%';
		const distances = (!!props.profile)
			? this.computeDistances(props.profile, props.multiplier)
			: {};

		return (
			<svg
				className='attacker-profile-component'
				width={props.width}
				height={props.height}
			>
				<g className='profile-dots'>
					<circle
						cx={cx}
						cy={cy}
						r={(66*2) / 2}
						fill='none'
						stroke='lightgray'
						strokeWidth='0.5px'
					/>

					{(!!props.profile)
						? <g>
							<CircleComponent

								radius={distances.intentR}
								colorIdx={distances.intentIdx}
								cx={cx}
								cy={cy}
								className='intentCircle'
								type='intent'
								setActiveHover={props.setActiveHover}
							/>
							<CircleComponent
								radius={distances.skillR}
								colorIdx={distances.skillIdx}
								cx={cx}
								cy={cy}
								className='skillCircle'
								type='skill'
								setActiveHover={props.setActiveHover}
							/>
							<CircleComponent
								radius={distances.visibilityR}
								colorIdx={distances.visibilityIdx}
								cx={cx}
								cy={cy} className='visibilityCircle'
								type='visibility'
								setActiveHover={props.setActiveHover}
							/>
							<CircleComponent
								radius={distances.limitR}
								colorIdx={distances.limitIdx}
								cx={cx}
								cy={cy} className='limitCircle'
								type='limit'
								setActiveHover={props.setActiveHover}
							/>
							<CircleComponent
								radius={distances.resourcesR}
								colorIdx={distances.resourcesIdx}
								cx={cx}
								cy={cy} className='resourcesCircle'
								type='resources'
								setActiveHover={props.setActiveHover}
							/>
						</g>
						: null
					}
				</g>
			</svg>
		);
	},

	computeDistances: function(profile, multiplier) {
		let distances = {};

		distances.skillIdx = skillArray.indexOf(profile.skill);
		distances.limitIdx = limitArray.indexOf(profile.limit);
		distances.visibilityIdx = visibilityArray.indexOf(profile.visibility);
		distances.visibilityIdx = visibilityArray.indexOf(profile.visibility);
		distances.intentIdx = accessIntentArray.indexOf(profile.access + ' ' + profile.intent);
		distances.resourcesIdx = resourcesArray.indexOf(profile.resources);

		distances.resourcesR = (distances.resourcesIdx + 1) * multiplier;
		distances.limitR = distances.resourcesR + (distances.limitIdx + 1) * multiplier;
		distances.visibilityR = distances.limitR + (distances.visibilityIdx + 1) * multiplier;
		distances.skillR = distances.visibilityR + (distances.skillIdx + 1) * multiplier;
		distances.intentR = distances.skillR + (distances.intentIdx + 1) * multiplier;

		return distances;
	},
});

module.exports = AttackerProfileComponent;

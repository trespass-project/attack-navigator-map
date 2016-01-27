'use strict';

var React = require('react');
// var _ = require('lodash');
var R = require('ramda');
// var mout = require('mout');

var DropdownSearchable = require('./DropdownSearchable.js');
var DropdownSelectize = require('./DropdownSelectize.js');


// TODO: store this elsewhere
var accessOptions = [
	{ eventKey: 'internal', title: 'internal', className: 'veryhigh' },
	{ eventKey: 'external', title: 'external', className: 'medium' }
];
var outcomeOptions = [
	{ eventKey: 'acquisition / theft', title: 'acquisition / theft' },
	{ eventKey: 'business advantage', title: 'business advantage' },
	{ eventKey: 'damage', title: 'damage' },
	{ eventKey: 'embarrassment', title: 'embarrassment' },
	{ eventKey: 'tech advantage', title: 'tech advantage' }
];
var limitsOptions = [
	{ eventKey: 'code of conduct', title: 'code of conduct', className: 'low' },
	{ eventKey: 'legal', title: 'legal', className: 'medium' },
	{ eventKey: 'extra-legal, minor', title: 'extra-legal, minor', className: 'high' },
	{ eventKey: 'extra-legal, major', title: 'extra-legal, major', className: 'veryhigh' }
];
var resourcesOptions = [
	{ eventKey: 'individual', title: 'individual', className: 'low' },
	{ eventKey: 'club', title: 'club', className: 'medium' },
	{ eventKey: 'contest', title: 'contest', className: 'high' },
	{ eventKey: 'team', title: 'team', className: 'high' },
	{ eventKey: 'organization', title: 'organization', className: 'veryhigh' },
	{ eventKey: 'government', title: 'government', className: 'veryhigh' }
];
var skillOptions = [
	{ eventKey: 'none', title: 'none', className: 'low' },
	{ eventKey: 'minimal', title: 'minimal', className: 'medium' },
	{ eventKey: 'operational', title: 'operational', className: 'high' },
	{ eventKey: 'adept', title: 'adept', className: 'veryhigh' }
];
var objectivesOptions = [
	{ eventKey: 'copy', title: 'copy' },
	{ eventKey: 'deny', title: 'deny' },
	{ eventKey: 'destroy', title: 'destroy' },
	{ eventKey: 'damage', title: 'damage' },
	{ eventKey: 'take', title: 'take' }
];
var visibilityOptions = [
	{ eventKey: 'overt', title: 'overt' },
	{ eventKey: 'covert', title: 'covert' },
	{ eventKey: 'clandestine', title: 'clandestine' }
];


function getClassName(list, value) {
	if (!value) { return ''; }
	return list.filter(function(item) {
			return item.eventKey === value;
		})[0].className || '';
}


var initialState = {};



var AttackerProfileEditorLanguage = React.createClass({
	getInitialState: function() {
		return initialState;
	},

	update: function(name, val) {
		this.state[name] = val;
		this.setState(this.state);
	},

	render: function() {
		const props = this.props;
		const state = this.state;

		var objectivesLabel = (state.objectives || []).join(', ');
		var visibilityLabel = (state.visibility || []).join(', ');

		var accessClass = getClassName(accessOptions, state.access);
		var limitsClass = getClassName(limitsOptions, state.limits);
		var resourcesClass = getClassName(resourcesOptions, state.resources);
		var skillClass = getClassName(skillOptions, state.skill);

		return (
			<div className='attackerProfile-editor-language language'>
				<span><b>The attacker's</b></span>
				<ul>
					<li>
						<div className={'bar ' + accessClass}></div>
						<span>access is </span>
						<DropdownSearchable
							name={'access'}
							title={state.access || '<access>'}
							value={state.access}
							searchable={false}
							items={accessOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
					<li>
						<div className={'bar ' + limitsClass}></div>
						<span>limits are </span>
						<DropdownSearchable
							name={'limits'}
							title={state.limits || '<limits>'}
							value={state.limits}
							searchable={false}
							items={limitsOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
					<li>
						<div className={'bar ' + resourcesClass}></div>
						<span>resources are </span>
						<DropdownSearchable
							name={'resources'}
							title={state.resources || '<resources>'}
							value={state.resources}
							searchable={false}
							items={resourcesOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
					<li>
						<div className={'bar ' + skillClass}></div>
						<span>skill is </span>
						<DropdownSearchable
							name={'skill'}
							title={state.skill || '<skill>'}
							value={state.skill}
							searchable={false}
							items={skillOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
					<li>
						<span>desired outcome is </span>
						<DropdownSearchable
							name={'outcome'}
							title={state.outcome || '<outcome>'}
							value={state.outcome}
							searchable={false}
							items={outcomeOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
					<li>
						<span>objectives are </span>
						<DropdownSelectize
							name={'objectives'}
							title={objectivesLabel || '<objectives>'}
							value={state.objectives}
							items={objectivesOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
					<li>
						<span>visibility is </span>
						<DropdownSelectize
							name={'visibility'}
							title={visibilityLabel || '<visibility>'}
							value={state.visibility}
							items={visibilityOptions}
							displayAttribute='title'
							valueAttribute='eventKey'
							handleSelection={this.update}
						/>
					</li>
				</ul>
			</div>
		);
	},
});


module.exports = AttackerProfileEditorLanguage;

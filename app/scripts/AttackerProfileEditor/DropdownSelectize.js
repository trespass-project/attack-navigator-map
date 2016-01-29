'use strict';

const React = require('react');
const _ = require('lodash');
const Selectize = require('./Selectize.js');

const common = require('./dropdown-common.js');


const DropdownSelectize = React.createClass({
	propTypes: {
		title: React.PropTypes.string.isRequired,
		name: React.PropTypes.string.isRequired,
		value: React.PropTypes.array,
		displayAttribute: React.PropTypes.string,
		valueAttribute: React.PropTypes.string,
		items: React.PropTypes.array.isRequired,
		handleSelection: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			name: 'tags',
			value: [],
			displayAttribute: 'name',
			valueAttribute: '_id',
			handleSelection: function() {}
		};
	},

	getInitialState: function() {
		return {
			tags: this.props.value || []
		};
	},

	render: function() {
		let state = this.state;
		const props = this.props;

		return (
			<span className='dropdown dropdown-selectize'>
				<a href='#' data-toggle='dropdown' className='dropdown-toggle'>
					{props.title}{common.caret}
				</a>
				<ul role='menu' className='dropdown-menu'>
					<li>
						<div>
							<form className='form'>
								<div className='input-group filter' role='search'>
									<Selectize
										type='text'
										value={state.tags.join(',')}
										onChange={this.updateTags}
										displayAttribute={props.displayAttribute}
										valueAttribute={props.valueAttribute}
										options={props.items}
									/>
								</div>
							</form>
						</div>
					</li>
				</ul>
			</span>
		);
	},

	updateTags: function(values) {
		let state = this.state;
		const props = this.props;

		let tags = values.split(',');
		tags = _.compact(tags);

		state.tags = tags;
		this.setState(state);

		props.handleSelection(props.name, tags);
	},
});


module.exports = DropdownSelectize;

'use strict';

const React = require('react');
const R = require('ramda');
const MenuItem = require('react-bootstrap').MenuItem;

const common = require('./dropdown-common.js');


let DropdownSearchable = React.createClass({
	propTypes: {
		title: React.PropTypes.string.isRequired,
		name: React.PropTypes.string.isRequired,
		searchable: React.PropTypes.bool,
		items: React.PropTypes.array.isRequired,
		displayAttribute: React.PropTypes.string,
		valueAttribute: React.PropTypes.string,
		handleSelection: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			searchable: true,
			handleSelection: function() {}
		};
	},

	renderItem: function(item, index) {
		const props = this.props;

		if (item.divider) {
			return common.divider;
		}

		if (item.header) {
			return <MenuItem header={true} key={index}>{item[props.displayAttribute]}</MenuItem>;
		}

		return (
			<MenuItem
				onSelect={R.partial(this.handleSelection, [item[props.displayAttribute]])}
				eventKey={item[props.valueAttribute]}
				key={index}>{item[props.displayAttribute]}
			</MenuItem>
		);
	},

	renderSearch: function() {
		return (
			<div>
				<form className='form'>
					<div className='input-group filter' role='search'>
						<input
							className='form-control'
							onChange={this.handleChange}
							onKeyDown={this.handleKeyDown}
							value={this.state.query}
							type='search'
							placeholder='search'
						/>
						{/*<div className='input-group-addon'>
							<span className='glyphicon glyphicon-search'></span>
						</div>*/}
					</div>
				</form>
				{/*common.divider*/ null}
			</div>
		);
	},

	getInitialState: function() {
		return {
			query: ''
		};
	},

	render: function() {
		let state = this.state;
		const props = this.props;

		const re = new RegExp(state.query, 'ig');
		const options = props.items
			.filter(function(item) {
				if (item[props.valueAttribute] === null) { return true; } // always show default option
				if (item.divider) { return true; }
				if (item.header) { return true; }
				return item[props.displayAttribute].match(re);
			});

		return (
			<span className='dropdown'>
				<a href='#' data-toggle='dropdown' className='dropdown-toggle'>
					{props.title}{common.caret}
				</a>
				<ul role='menu' className='dropdown-menu'>
					{(props.searchable)
						? this.renderSearch()
						: null}
					{options.map(this.renderItem)}
				</ul>
			</span>
		);
	},

	handleChange: function(event) {
		this.setState({
			query: event.target.value
		});
	},

	handleKeyDown: function(event) {
		if (event.keyCode === 13) { // enter
			event.preventDefault();
		}
	},

	handleSelection: function(value, event) {
		const props = this.props;
		props.handleSelection(props.name, value);
	}
});


module.exports = DropdownSearchable;

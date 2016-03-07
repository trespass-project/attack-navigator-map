'use strict';

let $ = require('jquery');
let _ = require('lodash');
let R = require('ramda');
let Q = require('q');
let utils = require('../../utils.js');
let React = require('react');

let LibraryItem = require('./LibraryItem.js');


let Library = React.createClass({
	propTypes: {
		items: React.PropTypes.array.isRequired,
		title: React.PropTypes.string.isRequired,
		renderItem: React.PropTypes.func,

		showFilter: React.PropTypes.bool,
		// modelComponentTypes: React.PropTypes.array.isRequired,
		// modelComponentTypesFilter: React.PropTypes.array.isRequired,
	},

	getDefaultProps: function() {
		return {
			renderItem: this.renderListItem,

			showFilter: false,
			// modelComponentTypes: [],
			// modelComponentTypesFilter: [],
		};
	},

	getInitialState: function() {
		return {
			searchQuery: '',
			itemsFiltered: this.props.items || [],
		};
	},

	// renderLoading: function() {
	// 	// TODO: react-loader
	// 	return (this.props.loading)
	// 		? <div>loading...</div>
	// 		: null;
	// },

	// renderError: function() {
	// 	const state = this.state;
	// 	return (state.error)
	// 		? <div>{state.error.statusText}: {state.error.responseText}</div>
	// 		: null;
	// },

	renderFilterItem: function(item) {
		const props = this.props;
		const checked = R.contains(item, props.modelComponentTypesFilter);
		return (
			<label key={item}>
				<input type='checkbox' value={item} checked={checked} className=''> {item}</input>
			</label>
		);
	},

	renderFilter: function() {
		const props = this.props;

		if (!props.showFilter) { return null; }

		return <form className='form-inline type-filter' onChange={this.filterType} onSubmit={this.onSubmit}>
			{props.modelComponentTypes.map(this.renderFilterItem)}
		</form>;
	},

	renderListItem: function(item, index) {
		const props = this.props;
		let onClick = null;
		if (_.isFunction(props.onClick)) {
			onClick = function(event) { props.onClick(item); };
		}

		return (
			<LibraryItem
				{...props}
				onClick={onClick}
				key={item.id || index}
				data={item}
				showType={props.showFilter}
			/>
		);
	},

	render: function() {
		const props = this.props;
		const state = this.state;
		const itemsFiltered = state.itemsFiltered;

		return (
			<div className='panel-section library-component'>
				<h3 className='title' style={{ textTransform: 'capitalize' }}>{props.title}</h3>
				<div className='search form-group'>
					<div className='input-group'>
						<input ref='searchInput' type='search' className='form-control' placeholder='search' onChange={this.search}></input>
						<div className='btn input-group-addon' onClick={this.clearSearch}>
							<span className='glyphicon glyphicon-remove'></span>
						</div>
					</div>
				</div>
				{this.renderFilter()}
				<div className='results'>
					<ul className='list-group'>
						{itemsFiltered.map(this.renderListItem)}
					</ul>
				</div>
			</div>
		);
	},

	// 	onSubmit: function(event) {
	// 		event.preventDefault();
	// 	},

	// 	filterType: function(event) {
	// 		libraryActions.filterByType(event.target.value, event.target.checked);
	// 	},

	clearSearch: function() {
		$(this.refs['searchInput']).val('');
		this._search('');
	},

	search: function(event) {
		const val = $(this.refs['searchInput']).val();
		this._search(val);
	},

	_search: function(query) {
		const list = this.props.items;
		this.setState({
			itemsFiltered: utils.filterList(
				list,
				query.trim(),
				{ fields: ['label'] }
			)
		});
	}
});

module.exports = Library;

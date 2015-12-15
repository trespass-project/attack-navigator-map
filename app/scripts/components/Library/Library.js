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
		title: React.PropTypes.string.isRequired,
		url: React.PropTypes.string.isRequired,
		filter: React.PropTypes.func,
		renderItem: React.PropTypes.func,

		showFilter: React.PropTypes.bool,
		componentTypes: React.PropTypes.array.isRequired,
		componentTypesFilter: React.PropTypes.array.isRequired,
	},

	getDefaultProps: function() {
		return {
			filter: function() { return true; },
			renderItem: this.renderListItem,

			showFilter: false,
			componentTypes: [],
			componentTypesFilter: [],
		};
	},

	getInitialState: function() {
		return {
			loading: true,
			error: null,
			searchQuery: '',
			listFiltered: [],
			list: [],
		};
	},

	componentWillMount: function() {
		let that = this;
		let req = $.getJSON(this.props.url, {});

		that.setState({
			loading: true
		});

		Q(req)
			.then(function(data) {
				that.setState({
					list: data.list,
					listFiltered: data.list,
					error: null,
					loading: false
				});
			},
			function(err) {
				console.error(err);
				that.setState({
					list: [],
					listFiltered: [],
					error: err,
					loading: false
				});
			});
	},

	renderLoading: function() {
		// TODO: react-loader
		return (this.props.loading)
			? <div>loading...</div>
			: null;
	},

	renderError: function() {
		const state = this.state;
		return (state.error)
			? <div>{state.error.statusText}: {state.error.responseText}</div>
			: null;
	},

	renderFilterItem: function(item) {
		const props = this.props;
		const checked = R.contains(item, props.componentTypesFilter);
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
			{props.componentTypes.map(this.renderFilterItem)}
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
		let that = this;
		const props = this.props;
		const state = this.state;
		const listFiltered = state.listFiltered;

		return (
			<div className='panel-section library-component'>
				<h3 className='title'>{props.title}</h3>
				<div className='search form-group'>
					<div className='input-group'>
						<input ref='searchInput' type='search' className='form-control' placeholder='search' onChange={this.search}></input>
						<div className='btn input-group-addon' onClick={this.clearSearch}>
							<span className='glyphicon glyphicon-remove'></span>
						</div>
					</div>
				</div>
				{this.renderFilter()}
				{this.renderLoading()}
				{this.renderError()}
				<div className='results'>
					<ul className='list-group'>
						{listFiltered
							.filter(props.filter)
							.map(this.renderListItem)}
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
		$(this.refs['searchInput'].getDOMNode()).val('');
		this._search('');
	},

	search: function(event) {
		this._search($(this.refs['searchInput'].getDOMNode()).val());
	},

	_search: function(query) {
		const state = this.state;
		query = query.trim();
		this.setState({
			listFiltered: utils.filterList(state.list, query, { fields: ['label'] })
		});
	}
});

module.exports = Library;

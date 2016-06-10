const $ = require('jquery');
const _ = require('lodash');
const R = require('ramda');
const utils = require('../../utils.js');
const React = require('react');

const LibraryItem = require('./LibraryItem.js');
const UsageHint = require('../../UsageHint.js');


const Library = React.createClass({
	propTypes: {
		items: React.PropTypes.array.isRequired,
		title: React.PropTypes.string.isRequired,
		renderItem: React.PropTypes.func,

		showFilter: React.PropTypes.bool,
		// modelComponentTypes: React.PropTypes.array.isRequired,
		// modelComponentTypesFilter: React.PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
			renderItem: this.renderListItem,

			showFilter: false,
			// modelComponentTypes: [],
			// modelComponentTypesFilter: [],
		};
	},

	getInitialState() {
		return {
			searchQuery: '',
			itemsFiltered: this.props.items || [],
		};
	},

	componentWillUpdate(nextProps, nextState) {
		const shouldUpdate = (this.props.items.length !== nextProps.items.length);
		if (shouldUpdate) {
			this.setState({ itemsFiltered: nextProps.items });
		}
	},

	renderFilterItem(item) {
		const props = this.props;
		const checked = R.contains(item, props.modelComponentTypesFilter);
		return (
			<label key={item}>
				<input type='checkbox' value={item} checked={checked} className=''> {item}</input>
			</label>
		);
	},

	renderFilter() {
		const props = this.props;

		if (!props.showFilter) { return null; }

		return <form className='form-inline type-filter' onChange={this.filterType} onSubmit={this.onSubmit}>
			{props.modelComponentTypes.map(this.renderFilterItem)}
		</form>;
	},

	renderListItem(item, index) {
		const props = this.props;
		let onClick = null;
		if (_.isFunction(props.onClick)) {
			onClick = (event) => {
				props.onClick(item);
			};
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

	render() {
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

				<UsageHint>
					drag and drop items from list onto the map
				</UsageHint>

				<div className='results'>
					<ul className='list-group'>
						{itemsFiltered.map(this.renderListItem)}
					</ul>
				</div>
			</div>
		);
	},

	// 	onSubmit(event) {
	// 		event.preventDefault();
	// 	},

	// 	filterType(event) {
	// 		libraryActions.filterByType(event.target.value, event.target.checked);
	// 	},

	clearSearch() {
		$(this.refs['searchInput']).val('');
		this._search('');
	},

	search(event) {
		const val = $(this.refs['searchInput']).val();
		this._search(val);
	},

	_search(query) {
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

'use strict';

var flummox = require('flummox');
var R = require('ramda');
var utils = require('../../utils.js');

const labelPropertyName = 'label';


class LibraryStore extends flummox.Store {

	constructor(flux, name) {
		super();

		const libraryActionIds = flux.getActionIds(name);
		this.register(libraryActionIds.loadData, this.handleNewData);
		this.register(libraryActionIds.filterList, this.handleFilter);
		this.register(libraryActionIds.filterByType, this.filterByType);

		this.cache = {};
		this.cache.list = []; // to cache the full data set

		this.state = {
			list: this.cache.list,
			query: '',
			componentTypes: [],
			componentTypesFilter: [],
		};
	}


	handleNewData(action) {
		if (this.cache.list.length) { return; }

		const that = this;

		that.setState({
			loading: true,
			error: null
		});

		action.promise
			.success(function(data, status, jqXHR) {
				var sortByLabel = R.partial(utils.sortBy, labelPropertyName);
				const list = data.list.sort(sortByLabel);
				that.cache.list = list;
				const componentTypes = R.uniq(list.map(function(item) { return item.type; }));
				that.setState({
					list: list,
					componentTypes: componentTypes,
					componentTypesFilter: componentTypes
				});
			})
			.error(function(jqXHR, status, errorMessage) {
				that.setState({
					error: {
						status,
						errorMessage
					}
				});
			})
			.always(function() {
				that.setState({ loading: false });
			});
	}


	handleFilter(action) {
		const that = this;
		this.setState({
			list: utils.filterList(
				that.cache.list,
				action.query,
				{ fields: [labelPropertyName] }
			)
		});
	}


	filterByType(action) {
		const that = this;
		const componentTypesFilter = (action.checked)
			? R.union(this.state.componentTypesFilter, [action.type])
			: R.difference(this.state.componentTypesFilter, [action.type]);

		const list = that.cache.list.filter(function(item) {
			return R.contains(item.type, componentTypesFilter);
		});

		this.setState({
			componentTypesFilter,
			list,
		});
	}

}


module.exports = LibraryStore;

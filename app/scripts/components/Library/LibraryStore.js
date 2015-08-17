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

		this.cache = {};
		this.cache.list = []; // to cache the full data set

		this.state = {
			list: this.cache.list,
			query: '',
		};
	}


	handleNewData(action) {
		if (this.cache.list.length) { return; }

		var that = this;

		that.setState({
			loading: true,
			error: null
		});

		action.promise
			.success(function(data, status, jqXHR) {
				var sortByLabel = R.partial(utils.sortBy, labelPropertyName);
				const list = data.list.sort(sortByLabel);
				that.cache.list = list;
				that.setState({ list: list });
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
		var that = this;
		this.setState({
			list: utils.filterList(
				that.cache.list,
				action.query,
				{ fields: [labelPropertyName] }
			)
		});
	}

}


module.exports = LibraryStore;

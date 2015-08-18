'use strict';

var $ = require('jquery');
var _ = require('lodash');
var flummox = require('flummox');


class LibraryActions extends flummox.Actions {

	constructor() {
		super();
	}

	loadData(url) {
		var promise = $.ajax({
			url: url,
			dataType: 'json',
		});

		return {
			promise: promise
		};
	}

	filterList(query) {
		return {
			query: query
		};
	}

	filterByType(componentType, checked) {
		return {
			componentType,
			checked,
		};
	}

}


module.exports = LibraryActions;

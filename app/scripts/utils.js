'use strict';

var _ = require('lodash');
var Sifter = require('sifter');


function getAllMethods(obj) {
	return Object.getOwnPropertyNames(obj)
		.filter(function(key) {
			return _.isFunction(obj[key]);
		});
}


function filterList(list, query='', options) {
	var defaults = {
		// fields: ['label'],
		conjunction: 'and'
	};
	options = _.defaults(options, defaults);

	if (list.length) {
		var sifter = new Sifter(list);
		var results = sifter.search(query, options);
		var filtered = results.items.map(function(result, index){
			return list[result.id];
		});
		return filtered;
	} else {
		return list;
	}
}


function sortBy(property, a, b) {
	var result = a[property].localeCompare(b[property]);
	return result;
}


module.exports = {
	getAllMethods,
	filterList,
	sortBy,
};

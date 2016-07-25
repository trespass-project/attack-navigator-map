const _ = require('lodash');
const Sifter = require('sifter');


function getAllMethods(obj) {
	return Object.getOwnPropertyNames(obj)
		.filter((key) => {
			return _.isFunction(obj[key]);
		});
}


function filterList(list, query='', options) {
	const defaults = {
		// fields: ['label'],
		conjunction: 'and'
	};
	options = _.defaults(options, defaults);

	if (list.length) {
		const sifter = new Sifter(list);
		const results = sifter.search(query, options);
		const filtered = results.items
			.map((result, index) => {
				return list[result.id];
			});
		return filtered;
	} else {
		return list;
	}
}


function sortBy(property, a, b) {
	const result = a[property].localeCompare(b[property]);
	return result;
}


module.exports = {
	getAllMethods,
	filterList,
	sortBy,
};

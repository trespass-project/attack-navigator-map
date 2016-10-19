const React = require('react');
const SelectizeDropdown = require('./SelectizeDropdown.js');
const trespass = require('trespass.js');


// allow 'create from search':
// http://furqanzafar.github.io/react-selectize/#/?category=simple
const createFromSearch = (options, search) => {
	if (!search || options.length) {
		return null;
	}
	const result = {
		label: search,
		value: trespass.model.sanitizePredicateId(search),
	};
	return result;
};


const RelationSelectize = React.createClass({
	render() {
		const props = this.props;

		return <SelectizeDropdown
			multi={false}
			name='relation'
			placeholder='relation'
			valueKey='value'
			labelKey='label'
			extraProps={{ createFromSearch }}
			{...props}
		/>;
	},
});

module.exports = RelationSelectize;

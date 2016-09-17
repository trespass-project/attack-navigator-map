const React = require('react');
const SelectizeDropdown = require('./SelectizeDropdown.js');


const RelationSelectize = React.createClass({
	render() {
		const props = this.props;

		// TODO: added ones are not persisted
		const createFromSearch = (options, search) => {
			if (!search || options.length) {
				return null;
			}
			const result = {
				label: search,
				value: search
					.toLowerCase()
					.replace(/ +/g, '-'),
			};
			return result;
		};

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

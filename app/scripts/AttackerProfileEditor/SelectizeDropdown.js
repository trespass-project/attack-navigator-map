const React = require('react');
const R = require('ramda');
const ReactSelectize = require('react-selectize');
const SimpleSelect = ReactSelectize.SimpleSelect;
const MultiSelect = ReactSelectize.MultiSelect;


module.exports = React.createClass({
	propTypes: {
		multi: React.PropTypes.bool,
		name: React.PropTypes.string.isRequired,
		placeholder: React.PropTypes.string,
		value: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.array,
		]),
		options: React.PropTypes.array,
		onChange: React.PropTypes.func,
		valueKey: React.PropTypes.string,
		labelKey: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			multi: true,
			placeholder: 'select...',
			value: undefined,
			options: [],
			valueKey: 'value',
			labelKey: 'label',
			onChange: (name, value) => {
				// console.log(name, value);
			},
		};
	},

	onChange(selectedOption) {
		const props = this.props;
		props.onChange(props.name, selectedOption.value);
	},

	render() {
		const props = this.props;

		const Selectize = (props.multi)
			? MultiSelect
			: SimpleSelect;

		const extraProps = {};
		if (props.multi && props.value) {
			extraProps.values = props.value;
		} else {
			extraProps.value = props.value;
		}

		// options need `label` and `value` properties
		const options = props.options
			.map((option) => {
				const omitKeys = [
					props.valueKey,
					props.labelKey,
				];
				return Object.assign(
					{},
					R.omit(omitKeys, option),
					{
						value: option[props.valueKey],
						label: option[props.labelKey] || 'missing label',
					}
				);
			});

		return <Selectize
			theme='bootstrap3'
			placeholder={props.placeholder}
			options={options}
			onValueChange={this.onChange}
			{...extraProps}
		/>;
	},
});
